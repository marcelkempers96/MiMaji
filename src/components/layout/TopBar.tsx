"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logo1 } from "@/assets/images";

interface TopBarProps {
  title: string;
  showBack?: boolean;
}

export default function TopBar({ title, showBack = true }: TopBarProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-surface sticky top-0 z-10 md:hidden">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center"
        >
          <ArrowLeft size={20} className="text-primary" />
        </button>
      )}
      <h1 className="text-lg font-bold text-text-primary flex-1">{title}</h1>
      <Link href="/">
        <img src={logo1.src} alt="MiMaji" className="h-[70px] w-auto" />
      </Link>
    </div>
  );
}
