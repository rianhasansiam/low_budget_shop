import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { revalidateOrders } from "@/lib/cache/revalidate";

// Helper to get the correct filter based on ID format
const getIdFilter = (id: string) => {
  try {
    if (ObjectId.isValid(id) && /^[a-fA-F0-9]{24}$/.test(id)) {
      return new ObjectId(id);
    }
  } catch {
    // If ObjectId creation fails, use string ID
  }
  return id;
};

// GET - Fetch orders (Admin: all orders, User: own orders only)
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const authResult = await requireAuth();
    if (!authResult.isAuthenticated) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = parseInt(searchParams.get("skip") || "0");
    const status = searchParams.get("status");
    const email = searchParams.get("email");

    const collection = await getCollection("orders");

    // Build query filter
    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    }
    
    // If not admin, only show user's own orders
    if (authResult.user.role !== 'admin') {
      filter.email = authResult.user.email;
    } else if (email) {
      // Admin can filter by email
      filter.email = email;
    }

    const orders = await collection
      .find(filter)
      .sort({ order_date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        data: orders,
        pagination: {
          total,
          limit,
          skip,
          hasMore: skip + orders.length < total,
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Create a new order (Authenticated users only)
export async function POST(request: NextRequest) {
  try {
    // User must be authenticated to place an order
    const authResult = await requireAuth();
    if (!authResult.isAuthenticated) {
      return authResult.response;
    }

    const body = await request.json();

    // Validate required fields
    if (!body.customer_name || !body.email || !body.phone || !body.items || !body.shipping_address) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: customer_name, email, phone, items, shipping_address" },
        { status: 400 }
      );
    }

    // Validate items array
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    // Extract product IDs from items (ONLY accept id and quantity from frontend)
    const productIds = body.items.map((item: { product_id: string }) => item.product_id);
    
    // Fetch actual product prices from database - NEVER trust frontend prices
    const productsCollection = await getCollection("allProducts");
    const products = await productsCollection.find({
      $or: productIds.map((id: string) => ({ _id: getIdFilter(id) }))
    }).toArray();

    // Create a map for quick product lookup
    const productMap = new Map(
      products.map(p => [p._id.toString(), p])
    );

    // Validate all products exist and build order items with verified prices
    const orderItems = [];
    let calculatedSubtotal = 0;

    for (const item of body.items) {
      const product = productMap.get(item.product_id);
      
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.product_id}` },
          { status: 400 }
        );
      }

      // Validate quantity
      const quantity = parseInt(item.quantity);
      if (isNaN(quantity) || quantity < 1) {
        return NextResponse.json(
          { success: false, error: `Invalid quantity for product: ${product.name}` },
          { status: 400 }
        );
      }

      // Use the ACTUAL price from database, not from request
      const verifiedPrice = product.price;
      const itemSubtotal = verifiedPrice * quantity;

      orderItems.push({
        product_id: item.product_id,
        name: product.name,
        quantity: quantity,
        unit_price: verifiedPrice, // From database
        subtotal: itemSubtotal, // Calculated on backend
        image: product.image || product.images?.[0] || null,
      });

      calculatedSubtotal += itemSubtotal;
    }

    // Calculate shipping cost from settings (fetch from database)
    let shippingCost = body.shipping_cost || 0;
    try {
      const settingsCollection = await getCollection("settings");
      const settings = await settingsCollection.findOne({});
      if (settings?.shipping) {
        const { standardFee, freeShippingThreshold, enableFreeShipping } = settings.shipping;
        if (enableFreeShipping && calculatedSubtotal >= freeShippingThreshold) {
          shippingCost = 0;
        } else {
          shippingCost = standardFee || 0;
        }
      }
    } catch (settingsError) {
      console.error("Error fetching shipping settings:", settingsError);
      // Use default shipping cost if settings fetch fails
    }

    // Validate and calculate coupon discount on backend
    let discount = 0;
    let validatedCouponCode = null;

    if (body.coupon_code) {
      try {
        const couponsCollection = await getCollection("coupons");
        const coupon = await couponsCollection.findOne({ 
          code: body.coupon_code.toUpperCase().trim() 
        });

        if (coupon && coupon.isActive && 
            new Date(coupon.expiryDate) >= new Date() &&
            coupon.usedCount < coupon.usageLimit &&
            calculatedSubtotal >= coupon.minPurchase) {
          
          // Calculate discount from database coupon values
          if (coupon.discountType === 'percentage') {
            discount = (calculatedSubtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
          discount = Math.round(discount);
          validatedCouponCode = coupon.code;
        }
        // If coupon is invalid, we simply don't apply it (no error, just no discount)
      } catch (couponError) {
        console.error("Error validating coupon:", couponError);
        // Don't fail the order, just don't apply the coupon
      }
    }

    // Calculate total on backend - NEVER use frontend total
    const calculatedTotal = calculatedSubtotal + shippingCost - discount;

    const order = {
      customer_name: body.customer_name,
      email: body.email,
      phone: body.phone,
      order_date: new Date().toISOString(),
      status: "pending", // Always start as pending
      subtotal: calculatedSubtotal, // Calculated on backend
      shipping_cost: shippingCost, // From settings or calculated
      discount: discount, // Calculated on backend from coupon
      coupon_code: validatedCouponCode,
      total_amount: calculatedTotal, // Calculated on backend
      shipping_address: {
        street: body.shipping_address.street,
        city: body.shipping_address.city,
        state: body.shipping_address.state,
        zip: body.shipping_address.zip || "",
        country: body.shipping_address.country,
      },
      items: orderItems, // Built with verified prices
      payment_method: body.payment_method || "Cash On Delivery",
      notes: body.notes || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collection = await getCollection("orders");
    const result = await collection.insertOne(order);

    // If coupon was used, increment usage count
    if (validatedCouponCode) {
      try {
        const couponsCollection = await getCollection("coupons");
        await couponsCollection.updateOne(
          { code: validatedCouponCode },
          { 
            $inc: { usedCount: 1 },
            $set: { updatedAt: new Date() }
          }
        );
      } catch (couponError) {
        console.error("Error updating coupon usage:", couponError);
        // Don't fail the order if coupon update fails
      }
    }

    // Revalidate orders cache on successful creation
    revalidateOrders();

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        orderId: result.insertedId,
        data: { ...order, _id: result.insertedId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}