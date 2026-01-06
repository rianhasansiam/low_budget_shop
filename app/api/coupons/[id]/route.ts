import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

// Helper to get the correct filter based on ID format
const getIdFilter = (id: string) => {
  try {
    if (ObjectId.isValid(id) && /^[a-fA-F0-9]{24}$/.test(id)) {
      return { _id: new ObjectId(id) };
    }
  } catch {
    // If ObjectId creation fails, use string ID
  }
  return { _id: id as unknown as ObjectId };
};

// GET - Fetch single coupon by ID (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const authResult = await requireAdmin();
    if (!authResult.isAdmin) {
      return authResult.response;
    }

    const { id } = await params;
    const collection = await getCollection("coupons");
    const coupon = await collection.findOne(getIdFilter(id));

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: coupon
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

// PUT - Update a coupon (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const authResult = await requireAdmin();
    if (!authResult.isAdmin) {
      return authResult.response;
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    };

    if (body.code) updateData.code = body.code.toUpperCase();
    if (body.discountType) updateData.discountType = body.discountType;
    if (body.discount !== undefined) updateData.discountValue = parseFloat(body.discount);
    if (body.minPurchase !== undefined) updateData.minPurchase = parseFloat(body.minPurchase);
    if (body.maxDiscount !== undefined) updateData.maxDiscount = body.maxDiscount ? parseFloat(body.maxDiscount) : null;
    if (body.usageLimit !== undefined) updateData.usageLimit = parseInt(body.usageLimit);
    if (body.expiryDate) updateData.expiryDate = new Date(body.expiryDate);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const collection = await getCollection("coupons");
    const result = await collection.updateOne(
      getIdFilter(id),
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    // Fetch updated coupon
    const updatedCoupon = await collection.findOne(getIdFilter(id));

    return NextResponse.json({
      success: true,
      message: "Coupon updated successfully",
      data: updatedCoupon
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a coupon (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is admin
    const authResult = await requireAdmin();
    if (!authResult.isAdmin) {
      return authResult.response;
    }

    const { id } = await params;
    const collection = await getCollection("coupons");
    const result = await collection.deleteOne(getIdFilter(id));

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Coupon not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Coupon deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}

// PATCH - Validate and apply coupon (for checkout)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // If action is 'validate', validate the coupon code
    if (body.action === 'validate') {
      const collection = await getCollection("coupons");
      const coupon = await collection.findOne({ code: id.toUpperCase() });

      if (!coupon) {
        return NextResponse.json(
          { success: false, error: "Invalid coupon code" },
          { status: 404 }
        );
      }

      // Check if coupon is active
      if (!coupon.isActive) {
        return NextResponse.json(
          { success: false, error: "This coupon is no longer active" },
          { status: 400 }
        );
      }

      // Check if coupon has expired
      if (new Date(coupon.expiryDate) < new Date()) {
        return NextResponse.json(
          { success: false, error: "This coupon has expired" },
          { status: 400 }
        );
      }

      // Check usage limit
      if (coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json(
          { success: false, error: "This coupon has reached its usage limit" },
          { status: 400 }
        );
      }

      // Check minimum purchase
      const cartTotal = body.cartTotal || 0;
      if (cartTotal < coupon.minPurchase) {
        return NextResponse.json(
          { success: false, error: `Minimum purchase of ৳${coupon.minPurchase} required` },
          { status: 400 }
        );
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = (cartTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.discountValue;
      }

      return NextResponse.json({
        success: true,
        data: {
          coupon,
          discount: Math.round(discount),
          finalTotal: Math.round(cartTotal - discount)
        }
      });
    }

    // If action is 'use', increment usage count
    if (body.action === 'use') {
      const collection = await getCollection("coupons");
      const result = await collection.updateOne(
        getIdFilter(id),
        { $inc: { usedCount: 1 }, $set: { updatedAt: new Date() } }
      );

      if (result.matchedCount === 0) {
        return NextResponse.json(
          { success: false, error: "Coupon not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Coupon usage updated"
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process coupon" },
      { status: 500 }
    );
  }
}
