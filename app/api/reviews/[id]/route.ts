import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { revalidateCache, CACHE_TAGS } from "@/lib/cache/revalidate";

// GET - Fetch a specific review or all reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await getCollection("reviews");

    // Check if ID is a valid ObjectId (single review) or product ID (all reviews for product)
    if (ObjectId.isValid(id) && id.length === 24) {
      // Try to find single review first
      const review = await collection.findOne({ _id: new ObjectId(id) });
      if (review) {
        return NextResponse.json({
          success: true,
          data: review,
        });
      }
    }

    // Otherwise, treat as productId and return all reviews for that product
    const reviews = await collection
      .find({ productId: id })
      .sort({ createdAt: -1 })
      .toArray();

    const total = reviews.length;
    let averageRating = 0;
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => {
        ratingBreakdown[review.rating as keyof typeof ratingBreakdown]++;
        return acc + review.rating;
      }, 0);
      averageRating = Math.round((sum / reviews.length) * 10) / 10;
    }

    return NextResponse.json({
      success: true,
      data: reviews,
      stats: {
        total,
        averageRating,
        ratingBreakdown,
      },
    });
  } catch (error) {
    console.error("Error fetching review(s):", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch review(s)" },
      { status: 500 }
    );
  }
}

// PUT - Update a review (owner only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.isAuthenticated) {
      return authResult.response;
    }

    const { id } = await params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid review ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rating, title, comment } = body;

    const collection = await getCollection("reviews");

    // Find the review
    const existingReview = await collection.findOne({ _id: new ObjectId(id) });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner or admin
    if (existingReview.userId !== authResult.user.id && authResult.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "You can only edit your own reviews" },
        { status: 403 }
      );
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (rating !== undefined) updateData.rating = Number(rating);
    if (title !== undefined) updateData.title = title.trim();
    if (comment !== undefined) updateData.comment = comment.trim();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    // Revalidate reviews cache on successful update
    revalidateCache(CACHE_TAGS.REVIEWS);

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a review (owner or admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.isAuthenticated) {
      return authResult.response;
    }

    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid review ID" },
        { status: 400 }
      );
    }

    const collection = await getCollection("reviews");

    // Find the review
    const review = await collection.findOne({ _id: new ObjectId(id) });

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner or admin
    if (review.userId !== authResult.user.id && authResult.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    // Revalidate reviews cache on successful deletion
    revalidateCache(CACHE_TAGS.REVIEWS);

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
