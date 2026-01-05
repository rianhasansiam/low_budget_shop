import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

// Default settings
const defaultSettings = {
  shipping: {
    standardFee: 100,
    freeShippingThreshold: 5000,
    expressShippingFee: 200,
    enableFreeShipping: true
  },
  general: {
    siteName: "BlackBerry",
    currency: "BDT",
    currencySymbol: "৳"
  }
};

// GET - Fetch settings
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

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const collection = await getCollection("settings");

    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    // Remove _id from update data if present
    delete updateData._id;
    delete updateData.type;

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
