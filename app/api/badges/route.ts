import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

// GET - Fetch all unique badges with product counts
export async function GET() {
  try {
    const collection = await getCollection("allProducts");
    
    // Aggregate to get badge counts (excluding null badges)
    const badges = await collection.aggregate([
      { $match: { badge: { $ne: null, $exists: true } } },
      {
        $group: {
          _id: "$badge",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          name: "$_id",
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    // On-demand revalidation only
    return NextResponse.json(badges);
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}
