import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET - Fetch single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    const collection = await getCollection("orders");
    const order = await collection.findOne({ _id: new ObjectId(id) });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT - Update an order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateFields: Record<string, unknown> = {};

    if (body.customer_name !== undefined) {
      updateFields.customer_name = body.customer_name;
    }
    if (body.email !== undefined) {
      updateFields.email = body.email;
    }
    if (body.phone !== undefined) {
      updateFields.phone = body.phone;
    }
    if (body.status !== undefined) {
      updateFields.status = body.status;
    }
    if (body.total_amount !== undefined) {
      updateFields.total_amount = body.total_amount;
    }
    if (body.payment_method !== undefined) {
      updateFields.payment_method = body.payment_method;
    }
    if (body.shipping_address !== undefined) {
      updateFields.shipping_address = {
        street: body.shipping_address.street,
        city: body.shipping_address.city,
        state: body.shipping_address.state,
        zip: body.shipping_address.zip,
        country: body.shipping_address.country,
      };
    }
    if (body.items !== undefined) {
      updateFields.items = body.items.map((item: {
        product_id: string;
        name: string;
        quantity: number;
        unit_price: number;
        subtotal?: number;
      }) => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal || item.unit_price * item.quantity,
      }));
    }

    // Always update the updatedAt timestamp
    updateFields.updatedAt = new Date();

    const collection = await getCollection("orders");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Fetch the updated order
    const updatedOrder = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// PATCH - Partially update an order (useful for status updates)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    const collection = await getCollection("orders");
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...body, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Fetch the updated order
    const updatedOrder = await collection.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID format" },
        { status: 400 }
      );
    }

    const collection = await getCollection("orders");

    // Optionally fetch the order before deletion to return it
    const order = await collection.findOne({ _id: new ObjectId(id) });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
