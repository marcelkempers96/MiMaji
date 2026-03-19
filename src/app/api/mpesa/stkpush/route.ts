import { NextRequest, NextResponse } from "next/server";
import { initiateSTKPush, formatKenyanPhone } from "@/lib/mpesa";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, amount, orderId } = body;

    if (!phone || !amount || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields: phone, amount, orderId" },
        { status: 400 }
      );
    }

    // Check if M-PESA credentials are configured
    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET || !process.env.MPESA_PASSKEY) {
      // Return a mock success response for demo/development
      return NextResponse.json({
        mock: true,
        MerchantRequestID: `MOCK-${Date.now()}`,
        CheckoutRequestID: `MOCK-CHK-${Date.now()}`,
        ResponseCode: "0",
        ResponseDescription: "Success. Request accepted for processing (demo mode)",
        CustomerMessage: "Success. Request accepted for processing",
      });
    }

    const formattedPhone = formatKenyanPhone(phone);
    const result = await initiateSTKPush({
      phone: formattedPhone,
      amount: Math.ceil(amount),
      orderId,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "STK push failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
