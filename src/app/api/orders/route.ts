import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { initiateSTKPush, formatKenyanPhone } from "@/lib/mpesa";
import { CreateOrderPayload } from "@/types";

const JUG_PRICE = parseInt(process.env.NEXT_PUBLIC_JUG_PRICE_KES || "200");
const DELIVERY_FEE = parseInt(process.env.NEXT_PUBLIC_DELIVERY_FEE_KES || "100");

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderPayload = await request.json();
    const { delivery_address, lat, lng, quantity, phone } = body;

    // Validate
    if (!delivery_address || !phone || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields: delivery_address, phone, quantity" },
        { status: 400 }
      );
    }

    if (quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { error: "Quantity must be between 1 and 10" },
        { status: 400 }
      );
    }

    const formattedPhone = formatKenyanPhone(phone);
    if (formattedPhone.length !== 12 || !formattedPhone.startsWith("254")) {
      return NextResponse.json(
        { error: "Invalid phone number. Use format: 254XXXXXXXXX or 07XXXXXXXX" },
        { status: 400 }
      );
    }

    const priceTotal = quantity * JUG_PRICE + DELIVERY_FEE;

    const supabase = createServiceClient();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        delivery_address,
        lat: lat || -1.2921,
        lng: lng || 36.8219,
        quantity,
        price_total: priceTotal,
        status: "pending_payment",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Initiate M-Pesa STK Push
    let checkoutRequestId = null;
    try {
      const stkResponse = await initiateSTKPush({
        phone: formattedPhone,
        amount: priceTotal,
        orderId: order.id,
      });

      checkoutRequestId = stkResponse.CheckoutRequestID;

      // Create payment record
      await supabase.from("payments").insert({
        order_id: order.id,
        mpesa_checkout_id: checkoutRequestId,
        amount: priceTotal,
        status: "pending",
      });
    } catch (mpesaError) {
      console.error("M-Pesa STK Push error:", mpesaError);
      // Don't fail the order — user can retry payment
    }

    return NextResponse.json({
      orderId: order.id,
      checkoutRequestId,
      priceTotal,
    });
  } catch (err) {
    console.error("Order API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
