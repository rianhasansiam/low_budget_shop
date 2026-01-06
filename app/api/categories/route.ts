import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

// GET - Fetch all categories (Public)
export async function GET() {
  try {
    const collection = await getCollection("categories");
    const categories = await collection.find({}).toArray();

    return NextResponse.json(categories, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST - Add a new category (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await requireAdmin();
    if (!authResult.isAdmin) {
      return authResult.response;
    }

    const body = await request.json();

    const category = {
      name: body.name,
      image: body.image,
      productCount: body.productCount || 0,
    };

    const collection = await getCollection("categories");
    const result = await collection.insertOne(category);

    return NextResponse.json({
      success: true,
      message: "Category added successfully",
      insertedId: result.insertedId,
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add category" },
      { status: 500 }
    );
  }
}
