import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

// GET - Fetch single category by ID (Public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await getCollection("categories");
    const category = await collection.findOne({ _id: new ObjectId(id) });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

// PUT - Update a category (Admin only)
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

    const updateData = {
      ...(body.name && { name: body.name }),
      ...(body.image && { image: body.image }),
      ...(body.productCount !== undefined && { productCount: body.productCount }),
    };

    const collection = await getCollection("categories");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a category (Admin only)
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
    const collection = await getCollection("categories");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
