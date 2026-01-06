import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/auth";

// GET - Fetch single slide (Public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await getCollection("hero_slides");
    
    const slide = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!slide) {
      return NextResponse.json(
        { success: false, error: "Slide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: slide,
    });
  } catch (error) {
    console.error("Error fetching slide:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch slide" },
      { status: 500 }
    );
  }
}

// PUT - Update single slide (Admin only)
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
    const collection = await getCollection("hero_slides");

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Only update provided fields
    if (body.image !== undefined) updateData.image = body.image;
    if (body.link !== undefined) updateData.link = body.link;
    if (body.alt !== undefined) updateData.alt = body.alt;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.active !== undefined) updateData.active = body.active;

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Slide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error updating slide:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update slide" },
      { status: 500 }
    );
  }
}

// DELETE - Delete slide (Admin only)
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
    const collection = await getCollection("hero_slides");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Slide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Slide deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting slide:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete slide" },
      { status: 500 }
    );
  }
}
