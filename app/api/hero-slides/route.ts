import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdmin } from "@/lib/auth";

export interface HeroSlide {
  _id?: string;
  image: string;
  link: string;
  alt: string;
  type: "main" | "side"; // main = carousel slides, side = side banners
  order: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Default slides
const defaultSlides: Omit<HeroSlide, "_id">[] = [
  {
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=600&fit=crop",
    link: "/allProducts",
    alt: "Winter Sale Banner - Electronics Deals",
    type: "main",
    order: 1,
    active: true,
  },
  {
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=600&fit=crop",
    link: "/allProducts",
    alt: "New Arrivals - Latest Gadgets",
    type: "main",
    order: 2,
    active: true,
  },
  {
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop",
    link: "/allProducts",
    alt: "Smart Home Devices",
    type: "main",
    order: 3,
    active: true,
  },
  {
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=500&fit=crop",
    link: "/allProducts",
    alt: "AirPods Pro - Wireless Earbuds",
    type: "side",
    order: 1,
    active: true,
  },
  {
    image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=500&fit=crop",
    link: "/allProducts",
    alt: "Smart Watch Collection",
    type: "side",
    order: 2,
    active: true,
  },
];

// GET - Fetch all hero slides (Public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "main" or "side"

    const collection = await getCollection("hero_slides");
    
    // Check if collection is empty, insert defaults
    const count = await collection.countDocuments();
    if (count === 0) {
      const slidesWithDates = defaultSlides.map(slide => ({
        ...slide,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await collection.insertMany(slidesWithDates);
    }

    // Build query
    const query: Record<string, unknown> = { active: true };
    if (type) {
      query.type = type;
    }

    const slides = await collection
      .find(query)
      .sort({ order: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: slides,
    });
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hero slides" },
      { status: 500 }
    );
  }
}

// POST - Add new slide (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await requireAdmin();
    if (!authResult.isAdmin) {
      return authResult.response;
    }

    const body = await request.json();
    const collection = await getCollection("hero_slides");

    // Get max order for the type
    const maxOrderDoc = await collection
      .find({ type: body.type })
      .sort({ order: -1 })
      .limit(1)
      .toArray();
    
    const newOrder = maxOrderDoc.length > 0 ? maxOrderDoc[0].order + 1 : 1;

    const newSlide = {
      image: body.image,
      link: body.link || "/allProducts",
      alt: body.alt || "Banner Image",
      type: body.type || "main",
      order: newOrder,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(newSlide);

    return NextResponse.json({
      success: true,
      data: { ...newSlide, _id: result.insertedId },
      insertedId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("Error adding hero slide:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add hero slide" },
      { status: 500 }
    );
  }
}

// PUT - Update slide order or bulk update (Admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await requireAdmin();
    if (!authResult.isAdmin) {
      return authResult.response;
    }

    const body = await request.json();
    const collection = await getCollection("hero_slides");

    // Bulk update for reordering
    if (body.slides && Array.isArray(body.slides)) {
      const bulkOps = body.slides.map((slide: { _id: string; order: number }) => ({
        updateOne: {
          filter: { _id: new ObjectId(slide._id) },
          update: { $set: { order: slide.order, updatedAt: new Date() } },
        },
      }));

      await collection.bulkWrite(bulkOps);

      return NextResponse.json({
        success: true,
        message: "Slides reordered successfully",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating hero slides:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update hero slides" },
      { status: 500 }
    );
  }
}
