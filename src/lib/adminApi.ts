const ADMIN_CODE = "5566";

const headers = {
  "Content-Type": "application/json",
  "x-admin-code": ADMIN_CODE,
};

export async function fetchAdminData(): Promise<{
  orders: Record<string, unknown>[];
  users: Record<string, unknown>[];
  vendors: Record<string, unknown>[];
  subscriptions: Record<string, unknown>[];
} | null> {
  try {
    const res = await fetch("/api/admin/data", { headers });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function adminAction(body: Record<string, unknown>): Promise<{ success?: boolean; error?: string; [key: string]: unknown }> {
  try {
    const res = await fetch("/api/admin/action", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    return res.json();
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Request failed" };
  }
}
