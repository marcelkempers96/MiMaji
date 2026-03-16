const AT_API_URL = "https://api.africastalking.com/version1/messaging";
const AT_SANDBOX_URL =
  "https://api.sandbox.africastalking.com/version1/messaging";

export async function sendSMS({
  to,
  message,
}: {
  to: string; // Format: +254XXXXXXXXX
  message: string;
}) {
  const apiKey = process.env.AT_API_KEY;
  const username = process.env.AT_USERNAME;

  if (!apiKey || !username) {
    console.warn("Africa's Talking credentials not configured, skipping SMS");
    return null;
  }

  const baseUrl =
    process.env.NODE_ENV === "production" ? AT_API_URL : AT_SANDBOX_URL;

  const formData = new URLSearchParams({
    username,
    to: to.startsWith("+") ? to : `+${to}`,
    message,
  });

  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: formData.toString(),
  });

  if (!res.ok) {
    console.error("SMS failed:", await res.text());
    return null;
  }

  return res.json();
}

export function orderConfirmationMessage(
  orderId: string,
  quantity: number,
  total: number
): string {
  return `MiMaji: Your order #${orderId} is confirmed! ${quantity}x 20L water jug${quantity > 1 ? "s" : ""} for KES ${total}. Delivery is on the way. Track: mimaji.co.ke/order/${orderId}`;
}

export function deliveryCompleteMessage(orderId: string): string {
  return `MiMaji: Your order #${orderId} has been delivered! Enjoy your fresh water 💧. Order again at mimaji.co.ke`;
}
