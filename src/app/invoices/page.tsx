"use client";

import { logo1 } from "@/assets/images";
import { FileText, Download, ChevronRight, Droplets } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { fetchUserOrders, OrderRecord, formatOrderDate, formatOrderId } from "@/lib/orders";

export default function InvoicesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/invoices");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.id) {
      fetchUserOrders(user.id).then((data) => {
        // Only show paid/completed orders as invoices
        setOrders(data.filter((o) => o.status !== "pending_payment"));
        setLoadingOrders(false);
      });
    }
  }, [user?.id]);

  if (!user) return null;

  const invoiceContent = (
    <>
      {loadingOrders ? (
        <div className="flex items-center justify-center py-12">
          <Droplets size={32} className="text-primary animate-pulse" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-surface shadow-card rounded-xl p-8 text-center">
          <FileText size={40} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-primary font-bold mb-1">No invoices yet</p>
          <p className="text-text-secondary text-sm mb-4">Invoices for your orders will appear here after payment</p>
          <Link href="/buy" className="text-primary font-semibold text-sm">
            Order Water →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const displayId = formatOrderId(order.id);
            const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`;
            const displayDate = formatOrderDate(order.created_at);

            return (
              <div key={order.id} className="bg-surface shadow-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary" />
                    <span className="font-bold text-sm text-text-primary">{invoiceNumber}</span>
                  </div>
                  <span className="text-xs text-text-secondary">{displayDate}</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-sm text-text-primary font-medium">{order.product_name || "Water Order"}</p>
                    <p className="text-xs text-text-secondary">
                      Order: {displayId}
                      {order.mpesa_ref ? ` · M-Pesa: ${order.mpesa_ref}` : ""}
                    </p>
                  </div>
                  <span className="font-bold text-text-primary">KES {order.price_total.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#F0F0F0]">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    order.status === "delivered" ? "bg-[#E8F5E9] text-[#2ECC71]" : "bg-primary-light text-primary"
                  }`}>
                    {order.status === "delivered" ? "Paid" : "Processing"}
                  </span>
                  <button
                    onClick={() => {
                      // Generate a simple invoice view
                      const invoiceWindow = window.open("", "_blank");
                      if (invoiceWindow) {
                        invoiceWindow.document.write(`
                          <html><head><title>Invoice ${invoiceNumber}</title>
                          <style>
                            body { font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
                            h1 { color: #2979C1; } table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                            th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #eee; }
                            th { background: #f5f5f5; } .total { font-size: 1.2em; font-weight: bold; }
                          </style></head><body>
                          <h1>MiMaji Invoice</h1>
                          <p><strong>Invoice:</strong> ${invoiceNumber}</p>
                          <p><strong>Date:</strong> ${displayDate}</p>
                          <p><strong>Customer:</strong> ${user.name} (${user.phone})</p>
                          <p><strong>Delivery Address:</strong> ${order.delivery_address}</p>
                          ${order.mpesa_ref ? `<p><strong>M-Pesa Ref:</strong> ${order.mpesa_ref}</p>` : ""}
                          <table>
                            <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
                            <tbody>
                              ${(order.order_items || []).map((item) => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>KES ${(item.price * item.quantity).toLocaleString()}</td></tr>`).join("")}
                            </tbody>
                          </table>
                          <p class="total">Total: KES ${order.price_total.toLocaleString()}</p>
                          <p style="color:#888; margin-top:40px; font-size:12px">MiMaji Water Delivery · support@mimaji.co.ke · +254 758 434 076</p>
                          </body></html>
                        `);
                        invoiceWindow.document.close();
                      }
                    }}
                    className="flex items-center gap-1 text-primary text-xs font-semibold hover:underline"
                  >
                    <Download size={14} />
                    View Invoice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile */}
      <div className="md:hidden">
        <TopBar title="Invoices" />
        <div className="max-w-md mx-auto px-4 pt-4">
          {invoiceContent}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <DesktopNav />
        <div className="max-w-3xl mx-auto px-8 py-10">
          <h1 className="text-3xl font-extrabold text-text-primary mb-6">Invoices</h1>
          {invoiceContent}
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
          <img src={logo1.src} alt="MiMaji" className="h-8 w-auto" />
        </Link>
        <nav className="flex items-center gap-8">
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/invoices" className="text-primary font-medium text-sm">Invoices</Link>
          <Link href="/profile" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Account</Link>
        </nav>
      </div>
    </header>
  );
}

function DesktopFooter() {
  return (
    <footer className="bg-[#1A2A3A] text-white py-12">
      <div className="max-w-6xl mx-auto px-8 text-center">
        <p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p>
      </div>
    </footer>
  );
}
