"use client";

import { User } from "lucide-react";
import TopBar from "@/components/layout/TopBar";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <TopBar title="Profile" />
      <div className="flex flex-col items-center justify-center px-6 pt-32">
        <User size={48} className="text-text-secondary" />
        <p className="text-lg font-bold text-text-primary mt-4">Coming Soon</p>
        <p className="text-text-secondary text-sm mt-2">
          Manage your account settings
        </p>
      </div>
    </div>
  );
}
