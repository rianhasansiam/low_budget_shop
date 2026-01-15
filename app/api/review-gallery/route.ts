import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

// GET - Fetch all review gallery images
export async function GET() {
  try {
    const collection = await getCollection("reviewGallery");

    const images = await collection
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Error fetching review gallery:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review gallery" },
      { status: 500 }
    );
  }
}

// POST - Add a new review gallery image (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const authResult = await requireAuth();
    if (!authResult.isAuthenticated) {
      return authResult.response;
    }

    if (authResult.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { image, caption } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: "Image is required" },
        { status: 400 }
      );
    }

    const collection = await getCollection("reviewGallery");

    // Get the highest order number
    const lastImage = await collection.findOne({}, { sort: { order: -1 } });
    const order = lastImage ? (lastImage.order || 0) + 1 : 1;

    const newImage = {
      image,
      caption: caption?.trim() || "",
      order,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newImage);

    return NextResponse.json(
      {
        success: true,
        message: "Image added successfully",
        data: { ...newImage, _id: result.insertedId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding review gallery image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add image" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a review gallery image (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.isAuthenticated) {
      return authResult.response;
    }

    if (authResult.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Image ID is required" },
        { status: 400 }
      );
    }

    const collection = await getCollection("reviewGallery");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review gallery image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 }
    );
  }
}

// PUT - Update image order or caption (admin only)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.isAuthenticated) {
      return authResult.response;
    }

    if (authResult.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, caption, order } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Image ID is required" },
        { status: 400 }
      );
    }

    const collection = await getCollection("reviewGallery");

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (caption !== undefined) {
      updateData.caption = caption.trim();
    }

    if (order !== undefined) {
      updateData.order = order;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Image not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image updated successfully",
    });
  } catch (error) {
    console.error("Error updating review gallery image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update image" },
      { status: 500 }
    );
  }
}
