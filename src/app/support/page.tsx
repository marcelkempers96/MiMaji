"use client";

import { MessageCircle } from "lucide-react";
import TopBar from "@/components/layout/TopBar";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Support" />
      <div className="flex flex-col items-center justify-center px-6 pt-32">
        <MessageCircle size={48} className="text-text-secondary" />
        <p className="text-lg font-bold text-text-primary mt-4">Coming Soon</p>
        <p className="text-text-secondary text-sm mt-2">
          Chat with our support team
        </p>
      </div>
    </div>
  );
}
