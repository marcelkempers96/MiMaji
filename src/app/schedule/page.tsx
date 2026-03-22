"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SchedulePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/buy");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-text-secondary text-sm">Redirecting to order page...</p>
    </div>
  );
}
