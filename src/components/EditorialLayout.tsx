"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { logo1 } from "@/assets/images";
import TopBar from "@/components/layout/TopBar";
import DesktopFooter from "@/components/layout/DesktopFooter";
import { Eyebrow, PageTitle, Standfirst } from "@/components/editorial";

/**
 * Shared chrome for the long-form pages. Each of them previously carried its
 * own slightly different nav, heading block and footer, so five pages drifted
 * into five layouts. One shell keeps the rhythm identical and the difference
 * between pages in the writing, where it belongs.
 */
export default function EditorialLayout({
  topBarTitle,
  eyebrow,
  title,
  standfirst,
  meta,
  children,
}: {
  topBarTitle: string;
  eyebrow: string;
  title: string;
  standfirst: string;
  /** Small line under the standfirst — a date, a scope note. */
  meta?: string;
  children: React.ReactNode;
}) {
  const header = (
    <header className="pb-10 md:pb-14">
      <Eyebrow>{eyebrow}</Eyebrow>
      <PageTitle>{title}</PageTitle>
      <Standfirst>{standfirst}</Standfirst>
      {meta && <p className="text-[#5A6B7C] text-[13px] mt-6">{meta}</p>}
    </header>
  );

  return (
    <div className="min-h-screen bg-white pb-16">
      <div className="md:hidden">
        <TopBar title={topBarTitle} showBack={true} />
        <div className="max-w-md mx-auto px-5 pt-8">
          {header}
          {children}
        </div>
      </div>

      <div className="hidden md:block">
        <nav className="border-b border-[#E6EBF0]">
          <div className="max-w-5xl mx-auto px-8 flex items-center justify-between h-16">
            <Link href="/" aria-label="MiMaji home">
              <Image src={logo1.src} alt="MiMaji" width={115} height={41} className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-8">
              <Link href="/about" className="text-[#46586B] hover:text-[#1A2A3A] text-sm transition-colors">About</Link>
              <Link href="/impact" className="text-[#46586B] hover:text-[#1A2A3A] text-sm transition-colors">Impact</Link>
              <Link href="/corporate" className="text-[#46586B] hover:text-[#1A2A3A] text-sm transition-colors">For Offices</Link>
              <Link
                href="/buy"
                className="bg-[#1A2A3A] text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#2979C1] transition-colors"
              >
                Order Water
              </Link>
            </div>
          </div>
        </nav>

        <article className="max-w-3xl mx-auto px-8 py-16 lg:py-24">
          {header}
          {children}
        </article>

        <DesktopFooter />
      </div>
    </div>
  );
}
