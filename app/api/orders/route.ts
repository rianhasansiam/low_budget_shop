import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

// GET - Fetch all orders with optional filtering
export async function GET(request: NextRequest) {
  try {
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
    if (email) {
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

// POST - Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.customer_name || !body.email || !body.phone || !body.items || !body.shipping_address) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: customer_name, email, phone, items, shipping_address" },
        { status: 400 }
      );
    }

    // Calculate total if not provided
    const calculatedTotal = body.items.reduce(
      (sum: number, item: { subtotal?: number; unit_price: number; quantity: number }) =>
        sum + (item.subtotal || item.unit_price * item.quantity),
      0
    );

    const order = {
      customer_name: body.customer_name,
      email: body.email,
      phone: body.phone,
      order_date: body.order_date || new Date().toISOString(),
      status: body.status || "pending",
      total_amount: body.total_amount || calculatedTotal,
      shipping_address: {
        street: body.shipping_address.street,
        city: body.shipping_address.city,
        state: body.shipping_address.state,
        zip: body.shipping_address.zip,
        country: body.shipping_address.country,
      },
      items: body.items.map((item: {
        product_id: string;
        name: string;
        quantity: number;
        unit_price: number;
        subtotal?: number;
      }) => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal || item.unit_price * item.quantity,
      })),
      payment_method: body.payment_method || "Cash On Delivery",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collection = await getCollection("orders");
    const result = await collection.insertOne(order);

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