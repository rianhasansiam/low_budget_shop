import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { revalidateCache, CACHE_TAGS } from "@/lib/cache/revalidate";

// GET - Fetch all reviews (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = parseInt(searchParams.get("skip") || "0");

    const collection = await getCollection("reviews");

    // Build query filter
    const filter: Record<string, unknown> = {};
    if (productId) {
      filter.productId = productId;
    }
    if (userId) {
      filter.userId = userId;
    }

    const reviews = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(filter);

    // Calculate average rating if filtering by product
    let averageRating = 0;
    if (productId && reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      averageRating = Math.round((sum / reviews.length) * 10) / 10;
    }

    return NextResponse.json({
      success: true,
      data: reviews,
      averageRating,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + reviews.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Create a new review (authenticated users only, must have delivered order)
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const authResult = await requireAuth();
    if (!authResult.isAuthenticated) {
      return authResult.response;
    }

    const body = await request.json();
    const { productId, orderId, rating, title, comment, images } = body;

    // Validate required fields
    if (!productId || !orderId || !rating) {
      return NextResponse.json(
        { success: false, error: "Product ID, Order ID, and rating are required" },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if order exists and is delivered
    const ordersCollection = await getCollection("orders");
    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
      email: authResult.user.email,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.status !== "delivered") {
      return NextResponse.json(
        { success: false, error: "You can only review products from delivered orders" },
        { status: 400 }
      );
    }

    // Check if product is in the order
    const productInOrder = order.items?.some(
      (item: { productId?: string; product_id?: string }) => 
        item.productId === productId || item.product_id === productId
    );

    if (!productInOrder) {
      return NextResponse.json(
        { success: false, error: "This product is not in your order" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this product for this order
    const reviewsCollection = await getCollection("reviews");
    const existingReview = await reviewsCollection.findOne({
      productId,
      orderId,
      userId: authResult.user.id,
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "You have already reviewed this product for this order" },
        { status: 400 }
      );
    }

    // Create the review
    const review = {
      productId,
      orderId,
      userId: authResult.user.id,
      userName: authResult.user.name || "Anonymous",
      userEmail: authResult.user.email,
      userImage: authResult.user.image || null,
      rating: Number(rating),
      title: title?.trim() || "",
      comment: comment?.trim() || "",
      images: Array.isArray(images) ? images.slice(0, 3) : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await reviewsCollection.insertOne(review);

    // Revalidate reviews cache on successful creation
    revalidateCache(CACHE_TAGS.REVIEWS);

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        data: { ...review, _id: result.insertedId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 }
    );
  }
}
