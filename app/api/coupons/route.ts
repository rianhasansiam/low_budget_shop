import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

// GET - Fetch all coupons (Admin only)
export async function GET() {
  try {
    // Check if user is admin
    const authResult = await requireAdmin();
    if (!authResult.isAdmin) {
      return authResult.response;
    }

    const collection = await getCollection("coupons");
    const coupons = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      data: coupons
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// POST - Create a new coupon (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await requireAdmin();
    if (!authResult.isAdmin) {
      return authResult.response;
    }

    const body = await request.json();

    // Validate required fields
    if (!body.code || !body.discount || !body.expiryDate) {
      return NextResponse.json(
        { success: false, error: "Code, discount, and expiry date are required" },
        { status: 400 }
      );
    }

    const collection = await getCollection("coupons");

    // Check if coupon code already exists
    const existingCoupon = await collection.findOne({ 
      code: body.code.toUpperCase() 
    });

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    const coupon = {
      code: body.code.toUpperCase(),
      discountType: body.discountType || 'percentage', // 'percentage' or 'fixed'
      discountValue: parseFloat(body.discount),
      minPurchase: parseFloat(body.minPurchase) || 0,
      maxDiscount: body.maxDiscount ? parseFloat(body.maxDiscount) : null,
      usageLimit: parseInt(body.usageLimit) || 100,
      usedCount: 0,
      expiryDate: new Date(body.expiryDate),
      isActive: body.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(coupon);

    return NextResponse.json({
      success: true,
      message: "Coupon created successfully",
      data: { ...coupon, _id: result.insertedId }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
