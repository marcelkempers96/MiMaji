"use client";

import { Droplets, ChevronRight } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import { mockOrders } from "@/data/orders";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Order History" />

      <div className="px-4 pt-4">
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className="bg-surface shadow-card rounded-xl p-4 mb-3"
          >
            {/* Top row: date + status */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-text-primary">{order.date}</span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success inline-block" />
                <span className="text-success text-sm font-medium">{order.status}</span>
              </div>
            </div>

            {/* Content row */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                <Droplets size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-text-primary">{order.productName}</p>
                <p className="text-text-secondary text-sm">
                  KES {order.originalPrice.toLocaleString()}
                </p>
              </div>
              <span className="font-bold text-text-primary">
                KES {order.amountPaid.toLocaleString()}
              </span>
            </div>

            {/* View Details */}
            <div className="flex justify-end mt-3">
              <button className="flex items-center gap-1 text-primary text-sm font-medium">
                View Details
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
