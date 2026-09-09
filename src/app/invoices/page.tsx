"use client";

import { logo1 } from "@/assets/images";
import { FileText, Download, ChevronRight, Droplets } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { VENDOR_MPESA_LOCAL } from "@/lib/contact";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";
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

  if (authLoading || !user) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-text-secondary text-sm">Loading...</p>
    </div>
  );

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
                      const deliveryFee = 100;
                      const subtotal = order.price_total - deliveryFee;
                      const invoiceWindow = window.open("", "_blank");
                      if (invoiceWindow) {
                        invoiceWindow.document.write(`<!DOCTYPE html>
<html><head><title>Invoice ${invoiceNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1A2A3A; background: #fff; }
  .invoice { max-width: 700px; margin: 0 auto; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #2979C1; padding-bottom: 20px; }
  .logo-section h1 { font-size: 28px; color: #2979C1; font-weight: 800; }
  .logo-section p { color: #8899AA; font-size: 12px; margin-top: 4px; }
  .invoice-info { text-align: right; }
  .invoice-info h2 { font-size: 24px; color: #2979C1; text-transform: uppercase; letter-spacing: 2px; }
  .invoice-info p { color: #8899AA; font-size: 13px; margin-top: 4px; }
  .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
  .details-block { flex: 1; }
  .details-block h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8899AA; margin-bottom: 8px; font-weight: 600; }
  .details-block p { font-size: 13px; color: #1A2A3A; margin-bottom: 3px; }
  .details-block p strong { font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  thead th { background: #2979C1; color: #fff; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
  thead th:last-child { text-align: right; }
  tbody td { padding: 12px 16px; border-bottom: 1px solid #F0F0F0; font-size: 13px; }
  tbody td:last-child { text-align: right; font-weight: 500; }
  tbody tr:nth-child(even) { background: #F8FAFC; }
  .totals { margin-left: auto; width: 280px; margin-top: 10px; }
  .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; border-bottom: 1px solid #F0F0F0; }
  .totals-row.grand { border-top: 2px solid #2979C1; border-bottom: none; padding-top: 12px; margin-top: 4px; }
  .totals-row.grand span { font-size: 18px; font-weight: 700; color: #2979C1; }
  .payment-info { background: #F8FAFC; border-radius: 8px; padding: 16px; margin-top: 30px; }
  .payment-info h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8899AA; margin-bottom: 8px; }
  .payment-info p { font-size: 13px; color: #1A2A3A; margin-bottom: 3px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E0E0E0; text-align: center; }
  .footer p { color: #8899AA; font-size: 11px; margin-bottom: 4px; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .invoice { padding: 20px; } }
</style></head><body>
<div class="invoice">
  <div class="header">
    <div class="logo-section">
      <h1>MiMaji</h1>
      <p>Water Delivery — Nairobi</p>
      <p>support@mimaji.co.ke | +254 704 476 338</p>
    </div>
    <div class="invoice-info">
      <h2>Invoice</h2>
      <p><strong>${invoiceNumber}</strong></p>
      <p>Date: ${displayDate}</p>
    </div>
  </div>
  <div class="details">
    <div class="details-block">
      <h3>Bill To</h3>
      <p><strong>${user.name}</strong></p>
      <p>${user.phone}</p>
      <p>${order.delivery_address || ""}</p>
    </div>
    <div class="details-block" style="text-align: right;">
      <h3>From</h3>
      <p><strong>MiMaji Ltd</strong></p>
      <p>Nairobi, Kenya</p>
      <p>M-PESA: ${VENDOR_MPESA_LOCAL}</p>
    </div>
  </div>
  <table>
    <thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
    <tbody>
      ${(order.order_items || []).map((item, idx) => `<tr><td>${idx + 1}</td><td>${item.name}</td><td>${item.quantity}</td><td>KES ${item.price.toLocaleString()}</td><td>KES ${(item.price * item.quantity).toLocaleString()}</td></tr>`).join("")}
    </tbody>
  </table>
  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>KES ${subtotal.toLocaleString()}</span></div>
    <div class="totals-row"><span>Delivery Fee</span><span>KES ${deliveryFee.toLocaleString()}</span></div>
    <div class="totals-row grand"><span>Total</span><span>KES ${order.price_total.toLocaleString()}</span></div>
  </div>
  <div class="payment-info">
    <h3>Payment Details</h3>
    <p>Status: <strong>${order.status === "delivered" ? "Paid" : "Processing"}</strong></p>
    ${order.mpesa_ref ? `<p>M-Pesa Reference: <strong>${order.mpesa_ref}</strong></p>` : ""}
    <p>Order ID: ${displayId}</p>
  </div>
  <div class="footer">
    <p>Thank you for choosing MiMaji!</p>
    <p>For every 100L delivered, we supply 10L to rural communities in Kenya.</p>
    <p>&copy; 2026 MiMaji Ltd. All rights reserved.</p>
  </div>
</div>
</body></html>`);
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
    <div className="min-h-screen bg-background pb-16">
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
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Products</Link>
          <Link href="/buy" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">Order Water</Link>
          <Link href="/orders" className="text-text-secondary hover:text-primary font-medium text-sm transition-colors">My Orders</Link>
          <Link href="/invoices" className="text-primary font-medium text-sm">Invoices</Link>
          <Link href="/profile" className="bg-primary text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#1a5a9a] transition-colors">Account</Link>
        </nav>
      </div>
    </header>
  );
}

