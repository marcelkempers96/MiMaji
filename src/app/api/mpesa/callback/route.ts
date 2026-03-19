import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const callback = body.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json({ error: "Invalid callback" }, { status: 400 });
    }

    const resultCode = callback.ResultCode;
    const resultDesc = callback.ResultDesc;
    const merchantRequestID = callback.MerchantRequestID;
    const checkoutRequestID = callback.CheckoutRequestID;

    if (resultCode === 0) {
      // Payment successful
      const metadata = callback.CallbackMetadata?.Item || [];
      const amount = metadata.find((i: { Name: string }) => i.Name === "Amount")?.Value;
      const mpesaReceiptNumber = metadata.find((i: { Name: string }) => i.Name === "MpesaReceiptNumber")?.Value;
      const phone = metadata.find((i: { Name: string }) => i.Name === "PhoneNumber")?.Value;

      console.log("M-Pesa Payment Successful:", {
        merchantRequestID,
        checkoutRequestID,
        amount,
        mpesaReceiptNumber,
        phone,
      });

      // TODO: Update order status in Supabase to 'paid'
    } else {
      console.log("M-Pesa Payment Failed:", { resultCode, resultDesc, merchantRequestID });
      // TODO: Update order status in Supabase to 'payment_failed'
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Error" }, { status: 500 });
  }
}
