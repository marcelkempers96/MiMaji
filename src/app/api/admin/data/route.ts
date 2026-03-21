import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const ADMIN_CODE = "5566";

export async function GET(req: NextRequest) {
  // Verify admin code from header
  const code = req.headers.get("x-admin-code");
  if (code !== ADMIN_CODE) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Fetch all data in parallel
  const [ordersRes, usersRes, vendorsRes, subscriptionsRes] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, phone, full_name, role, created_at").order("created_at", { ascending: false }),
    supabase.from("vendors").select("*, vendor_locations(*)").eq("active", true),
    supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    orders: ordersRes.data || [],
    users: usersRes.data || [],
    vendors: vendorsRes.data || [],
    subscriptions: subscriptionsRes.data || [],
    errors: {
      orders: ordersRes.error?.message || null,
      users: usersRes.error?.message || null,
      vendors: vendorsRes.error?.message || null,
      subscriptions: subscriptionsRes.error?.message || null,
    },
  });
}
