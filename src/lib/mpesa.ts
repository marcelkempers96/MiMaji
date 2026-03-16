const SANDBOX_URL = "https://sandbox.safaricom.co.ke";
const PRODUCTION_URL = "https://api.safaricom.co.ke";

const BASE_URL =
  process.env.NODE_ENV === "production" ? PRODUCTION_URL : SANDBOX_URL;

export async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const res = await fetch(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${credentials}` },
    }
  );

  if (!res.ok) {
    throw new Error(`M-Pesa auth failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function initiateSTKPush({
  phone,
  amount,
  orderId,
}: {
  phone: string; // Format: 254XXXXXXXXX
  amount: number;
  orderId: string;
}) {
  const token = await getAccessToken();
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString("base64");

  const res = await fetch(
    `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: orderId.slice(0, 12),
        TransactionDesc: "MiMaji Water Order",
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`STK Push failed: ${errText}`);
  }

  return res.json();
}

// Format Kenyan phone number to 254XXXXXXXXX
export function formatKenyanPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("254")) return cleaned;
  if (cleaned.startsWith("0")) return `254${cleaned.slice(1)}`;
  if (cleaned.startsWith("7") || cleaned.startsWith("1"))
    return `254${cleaned}`;
  return cleaned;
}
