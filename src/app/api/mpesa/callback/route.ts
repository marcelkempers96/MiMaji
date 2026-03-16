import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendSMS, orderConfirmationMessage } from "@/lib/sms";

interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: { Name: string; Value: string | number }[];
      };
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: MpesaCallbackBody = await request.json();
    const callback = body.Body.stkCallback;
    const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback;

    const supabase = createServiceClient();

    // Find the payment record
    const { data: payment } = await supabase
      .from("payments")
      .select("*, order:orders(*)")
      .eq("mpesa_checkout_id", CheckoutRequestID)
      .single();

    if (!payment) {
      console.error("Payment not found for checkout:", CheckoutRequestID);
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    if (ResultCode === 0) {
      // Payment successful
      const metadata = CallbackMetadata?.Item || [];
      const mpesaReceipt =
        metadata.find((i) => i.Name === "MpesaReceiptNumber")?.Value?.toString() || null;

      // Update payment
      await supabase
        .from("payments")
        .update({
          status: "success",
          mpesa_receipt: mpesaReceipt,
          raw_callback: body as unknown as Record<string, unknown>,
        })
        .eq("id", payment.id);

      // Update order
      await supabase
        .from("orders")
        .update({
          status: "paid",
          mpesa_ref: mpesaReceipt,
        })
        .eq("id", payment.order_id);

      // Send SMS confirmation
      if (payment.order) {
        const order = payment.order;
        try {
          await sendSMS({
            to: `+254${order.customer_id}`, // In production, fetch customer phone
            message: orderConfirmationMessage(
              order.id.slice(0, 8),
              order.quantity,
              order.price_total
            ),
          });
        } catch (smsErr) {
          console.error("SMS send failed:", smsErr);
        }
      }
    } else {
      // Payment failed
      await supabase
        .from("payments")
        .update({
          status: "failed",
          raw_callback: body as unknown as Record<string, unknown>,
        })
        .eq("id", payment.id);

      await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", payment.order_id);
    }

    // Safaricom expects this response
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("M-Pesa callback error:", err);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
}
