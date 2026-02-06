import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { revalidateSettings } from "@/lib/cache/revalidate";

// Default settings
const defaultSettings = {
  shipping: {
    standardFee: 100,
    freeShippingThreshold: 5000,
    expressShippingFee: 200,
    enableFreeShipping: true
  },
  general: {
    siteName: "EngineersGadget",
    currency: "BDT",
    currencySymbol: "৳"
  },
  topBanner: {
    message: "",
    enabled: false,
    backgroundColor: "#1f2937",
    textColor: "#ffffff"
  }
};

// GET - Fetch settings (Public - needed for frontend)
export async function GET() {
  try {
    const collection = await getCollection("settings");
    let settings = await collection.findOne({ type: "site_settings" });

    // If no settings exist, create default settings
    if (!settings) {
      const result = await collection.insertOne({
        type: "site_settings",
        ...defaultSettings,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      settings = {
        _id: result.insertedId,
        type: "site_settings",
        ...defaultSettings
      };
    }

    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update settings (Admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await requireAdmin();
    if (!authResult.isAdmin) {
      return authResult.response;
    }

    const body = await request.json();
    const collection = await getCollection("settings");

    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    // Remove _id, type, and createdAt from update data if present
    delete updateData._id;
    delete updateData.type;
    delete updateData.createdAt;

    const result = await collection.findOneAndUpdate(
      { type: "site_settings" },
      { 
        $set: updateData,
        $setOnInsert: { 
          type: "site_settings",
          createdAt: new Date() 
        }
      },
      { 
        upsert: true, 
        returnDocument: "after" 
      }
    );

    // Revalidate settings cache on successful update
    revalidateSettings();

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      data: result
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
