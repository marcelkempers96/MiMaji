import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

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

    const supabase = createServiceClient();

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

      // Find the payment record by checkout ID and update
      const { data: payment } = await supabase
        .from("payments")
        .select("order_id")
        .eq("mpesa_checkout_id", checkoutRequestID)
        .single();

      if (payment?.order_id) {
        // Update payment status
        await supabase
          .from("payments")
          .update({
            status: "success",
            mpesa_receipt: mpesaReceiptNumber,
            raw_callback: callback,
          })
          .eq("mpesa_checkout_id", checkoutRequestID);

        // Update order status to paid with mpesa ref
        await supabase
          .from("orders")
          .update({
            status: "paid",
            mpesa_ref: mpesaReceiptNumber,
          })
          .eq("id", payment.order_id);

        // Auto-assign order to the best matching vendor
        try {
          const { assignOrderToVendor } = await import("@/lib/vendor");
          await assignOrderToVendor(payment.order_id);
        } catch (e) {
          console.error("Error auto-assigning vendor:", e);
        }
      }
    } else {
      console.log("M-Pesa Payment Failed:", { resultCode, resultDesc, merchantRequestID });

      // Update payment status to failed
      await supabase
        .from("payments")
        .update({
          status: "failed",
          raw_callback: callback,
        })
        .eq("mpesa_checkout_id", checkoutRequestID);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Error" }, { status: 500 });
  }
}
