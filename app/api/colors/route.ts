import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

// GET - Fetch all unique colors with product counts
export async function GET() {
  try {
    const collection = await getCollection("allProducts");
    
    // Aggregate to get color counts
    const colors = await collection.aggregate([
      { $unwind: "$colors" },
      {
        $group: {
          _id: "$colors",
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
    return NextResponse.json(colors);
  } catch (error) {
    console.error("Error fetching colors:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch colors" },
      { status: 500 }
    );
  }
}
