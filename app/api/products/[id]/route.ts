import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Helper to get the correct filter based on ID format
const getIdFilter = (id: string) => {
  try {
    // Check if it's a valid ObjectId format (24 hex characters)
    if (ObjectId.isValid(id) && /^[a-fA-F0-9]{24}$/.test(id)) {
      return { _id: new ObjectId(id) };
    }
  } catch {
    // If ObjectId creation fails, use string ID
  }
  // Otherwise treat it as a string ID (for manually added data)
  return { _id: id as unknown as ObjectId };
};

// GET - Fetch single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await getCollection("allProducts");
    const product = await collection.findOne(getIdFilter(id));

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Remove _id from body if present to avoid update errors
    const { _id, ...updateData } = body;

    const collection = await getCollection("allProducts");
    const result = await collection.updateOne(
      getIdFilter(id),
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Fetch and return the updated product
    const updatedProduct = await collection.findOne(getIdFilter(id));

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await getCollection("allProducts");
    const result = await collection.deleteOne(getIdFilter(id));

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}