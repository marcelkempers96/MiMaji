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
