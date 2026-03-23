import { NextRequest, NextResponse } from "next/server";
import { initiateSTKPush, formatKenyanPhone } from "@/lib/mpesa";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, amount, orderId } = body;

    if (!phone || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: phone, amount" },
        { status: 400 }
      );
    }

    // Check if M-PESA credentials are configured
    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET || !process.env.MPESA_PASSKEY) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "M-Pesa payments are not configured. Please contact support." },
          { status: 503 }
        );
      }
      // Dev/staging only — return mock response
      const checkoutId = `MOCK-CHK-${Date.now()}`;
      return NextResponse.json({
        mock: true,
        MerchantRequestID: `MOCK-${Date.now()}`,
        CheckoutRequestID: checkoutId,
        ResponseCode: "0",
        ResponseDescription: "Success. Request accepted for processing (demo mode)",
        CustomerMessage: "Success. Request accepted for processing",
      });
    }

    const formattedPhone = formatKenyanPhone(phone);
    const result = await initiateSTKPush({
      phone: formattedPhone,
      amount: Math.ceil(amount),
      orderId: orderId || "pending",
    });

    // Create a payment record so the callback can find it
    if (result.CheckoutRequestID && orderId && orderId !== "pending") {
      try {
        const supabase = createServiceClient();
        await supabase.from("payments").insert({
          order_id: orderId,
          mpesa_checkout_id: result.CheckoutRequestID,
          amount: Math.ceil(amount),
          status: "pending",
        });
      } catch (e) {
        console.error("Failed to create payment record:", e);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "STK push failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
