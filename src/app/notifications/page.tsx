"use client";

import { logo1 } from "@/assets/images";
import { useState, useEffect, useCallback } from "react";
import { Bell, Package, Truck, CheckCircle2, Droplets, Clock, Smartphone, Trash2, BellOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";
import { useAuth } from "@/context/AuthContext";
import { fetchUserOrders, OrderRecord, mapOrderStatus, formatOrderId } from "@/lib/orders";
import { supabase } from "@/lib/supabase";

const hasSupabaseConfig =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-key";

interface Notification {
  id: string;
  type: "order_placed" | "order_confirmed" | "order_transit" | "order_delivered" | "payment" | "promo";
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

function getNotificationsKey(userId: string) { return `mimaji_notifications_${userId}`; }

function loadNotifications(userId: string): Notification[] {
  try {
    const raw = localStorage.getItem(getNotificationsKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveNotifications(userId: string, notifications: Notification[]) {
  try { localStorage.setItem(getNotificationsKey(userId), JSON.stringify(notifications)); } catch {}
}

function generateOrderNotifications(orders: OrderRecord[], userId: string): Notification[] {
  const existing = loadNotifications(userId);
  const existingIds = new Set(existing.map((n) => n.id));
  const newNotifs: Notification[] = [];

  for (const order of orders) {
    const orderId = formatOrderId(order.id);
    const status = mapOrderStatus(order.status);

    // Order placed notification
    const placedId = `${order.id}-placed`;
    if (!existingIds.has(placedId)) {
      newNotifs.push({
        id: placedId,
        type: "order_placed",
        title: "Order Placed",
        message: `Your order ${orderId} has been placed successfully.`,
        orderId: order.id,
        read: false,
        createdAt: order.created_at,
      });
    }

    // Order confirmed
    if (["Confirmed", "In Transit", "Delivered"].includes(status)) {
      const confirmedId = `${order.id}-confirmed`;
      if (!existingIds.has(confirmedId)) {
        newNotifs.push({
          id: confirmedId,
          type: "order_confirmed",
          title: "Order Confirmed",
          message: `Your order ${orderId} has been confirmed and is being prepared.`,
          orderId: order.id,
          read: false,
          createdAt: order.updated_at || order.created_at,
        });
      }
    }

    // In transit
    if (["In Transit", "Delivered"].includes(status)) {
      const transitId = `${order.id}-transit`;
      if (!existingIds.has(transitId)) {
        newNotifs.push({
          id: transitId,
          type: "order_transit",
          title: "Out for Delivery",
          message: `Your order ${orderId} is on its way! Get your delivery code ready.`,
          orderId: order.id,
          read: false,
          createdAt: order.updated_at || order.created_at,
        });
      }
    }

    // Delivered
    if (status === "Delivered") {
      const deliveredId = `${order.id}-delivered`;
      if (!existingIds.has(deliveredId)) {
        newNotifs.push({
          id: deliveredId,
          type: "order_delivered",
          title: "Order Delivered",
          message: `Your order ${orderId} has been delivered. Enjoy your fresh water!`,
          orderId: order.id,
          read: false,
          createdAt: order.updated_at || order.created_at,
        });
      }
    }

    // Payment received
    if (order.mpesa_ref) {
      const paymentId = `${order.id}-payment`;
      if (!existingIds.has(paymentId)) {
        newNotifs.push({
          id: paymentId,
          type: "payment",
          title: "Payment Received",
          message: `Payment for order ${orderId} received. Ref: ${order.mpesa_ref}`,
          orderId: order.id,
          read: false,
          createdAt: order.updated_at || order.created_at,
        });
      }
    }
  }

  if (newNotifs.length > 0) {
    const all = [...existing, ...newNotifs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    saveNotifications(userId, all);
    return all;
  }

  return existing.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function getNotifIcon(type: string) {
  switch (type) {
    case "order_placed": return <Package size={18} className="text-primary" />;
    case "order_confirmed": return <CheckCircle2 size={18} className="text-[#2ECC71]" />;
    case "order_transit": return <Truck size={18} className="text-[#F5A623]" />;
    case "order_delivered": return <CheckCircle2 size={18} className="text-[#2ECC71]" />;
    case "payment": return <Smartphone size={18} className="text-[#2ECC71]" />;
    case "promo": return <Bell size={18} className="text-primary" />;
    default: return <Bell size={18} className="text-text-secondary" />;
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/notifications");
    }
  }, [authLoading, user, router]);

  const refreshNotifications = useCallback(async () => {
    if (!user?.id) return;

    if (hasSupabaseConfig) {
      // Fetch from Supabase notifications table
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setNotifications(data.map((n: Record<string, unknown>) => ({
          id: n.id as string,
          type: ((n.type as string) || "promo") as Notification["type"],
          title: n.title as string,
          message: n.message as string,
          orderId: (n.order_id as string) || undefined,
          read: n.read as boolean,
          createdAt: n.created_at as string,
        })));
        setLoading(false);
        return;
      }
    }

    // Fallback: generate from orders (mock mode)
    const orders = await fetchUserOrders(user.id);
    const notifs = generateOrderNotifications(orders, user.id);
    setNotifications(notifs);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  if (authLoading || !user) return null;

  const markAllRead = async () => {
    if (!user?.id) return;
    if (hasSupabaseConfig) {
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    } else {
      saveNotifications(user.id, notifications.map((n) => ({ ...n, read: true })));
    }
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    if (!user?.id) return;
    if (hasSupabaseConfig) {
      await supabase.from("notifications").update({ read: true }).eq("id", id);
    } else {
      const updated = notifications.map((n) => n.id === id ? { ...n, read: true } : n);
      saveNotifications(user.id, updated);
    }
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = async () => {
    if (!user?.id) return;
    if (hasSupabaseConfig) {
      await supabase.from("notifications").delete().eq("user_id", user.id);
    } else {
      saveNotifications(user.id, []);
    }
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const content = (
    <>
      {/* Header actions */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-primary text-xs font-semibold">
              Mark all as read ({unreadCount})
            </button>
          )}
          <button onClick={clearAll} className="text-text-secondary text-xs font-medium flex items-center gap-1 ml-auto">
            <Trash2 size={12} /> Clear all
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Droplets size={32} className="text-primary animate-pulse" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-surface shadow-card rounded-xl p-8 text-center">
          <BellOff size={40} className="text-text-secondary mx-auto mb-3 opacity-50" />
          <p className="text-text-primary font-bold mb-1">No notifications yet</p>
          <p className="text-text-secondary text-sm">Your order updates and alerts will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href={notif.orderId ? `/track?orderId=${notif.orderId}` : "#"}
              onClick={() => markRead(notif.id)}
            >
              <div className={`bg-surface shadow-card rounded-xl p-4 flex items-start gap-3 hover:shadow-card-hover transition-shadow ${
                !notif.read ? "border-l-4 border-primary" : ""
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !notif.read ? "bg-primary-light" : "bg-gray-50"
                }`}>
                  {getNotifIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${!notif.read ? "text-text-primary" : "text-text-secondary"}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-text-secondary whitespace-nowrap">{timeAgo(notif.createdAt)}</span>
                  </div>
                  <p className="text-text-secondary text-xs mt-0.5">{notif.message}</p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="md:hidden">
        <TopBar title="Notifications" showBack={true} />
        <div className="max-w-md mx-auto px-4 pt-4">{content}</div>
      </div>

      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-2xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Notifications</h1>
          {content}
        </div>
        <DesktopFooter />
      </div>
    </div>
  );
}

function DesktopNav() {
  return (
    <header className="bg-surface border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/profile" className="text-primary font-medium text-sm">Account</Link>
        </nav>
      </div>
    </header>
  );
}
