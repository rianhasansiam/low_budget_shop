import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { revalidateProducts } from "@/lib/cache/revalidate";

// GET - Fetch products with pagination, filtering, and caching (Public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

    
    const skip = parseInt(searchParams.get("skip") || "0");
    const featured = searchParams.get("featured");
    const category = searchParams.get("category");

    const collection = await getCollection("allProducts");
    
    // Build query filter
    const filter: Record<string, unknown> = {};
    if (featured === "true") {
      filter.featured = true;
    }
    if (category) {
      filter.category = category;
    }

    const products = await collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();

    // Return without time-based cache - uses on-demand revalidation only
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Add a new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await requireAdmin();
    if (!authResult.isAdmin) {
      return authResult.response;
    }

    const body = await request.json();

    const product = {
      name: body.name,
      description: body.description,
      price: body.price,
      originalPrice: body.originalPrice,
      image: body.image,
      images: body.images || [body.image],
      category: body.category,
      colors: body.colors || [],
      badge: body.badge || null,
      stock: body.stock || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const collection = await getCollection("allProducts");
    const result = await collection.insertOne(product);

    // Revalidate product cache on successful creation
    revalidateProducts();

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      insertedId: result.insertedId,
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add product" },
      { status: 500 }
    );
  }
}

