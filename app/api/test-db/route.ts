import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

// GET - Test database connection (Admin only - for debugging)
export async function GET() {
  try {
    // Only admins should be able to see database info
    const authResult = await requireAdmin();
    if (!authResult.isAdmin) {
      return authResult.response;
    }

    const client = await clientPromise;
    
   
    await client.db().admin().ping();
    
   
    const dbName = process.env.MONGODB_DB_NAME || "lowbudget_ecommerce";
    const db = client.db(dbName);
    
   
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({
      success: true,
      message: "✅ Connected to MongoDB successfully!",
      database: dbName,
      collections: collections.map(c => c.name),
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "❌ Failed to connect to database",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
