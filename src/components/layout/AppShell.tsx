"use client";

import { usePathname } from "next/navigation";
import BottomTabBar from "./BottomTabBar";
import WhatsAppFloatingButton from "../WhatsAppBanner";

const HIDE_NAV_ROUTES = ["/login", "/confirm", "/delivery", "/track", "/vendor-portal", "/vendor-login", "/hidden-admin"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !HIDE_NAV_ROUTES.includes(pathname);
  const isVendor = pathname.startsWith("/vendor");
  const isAdmin = pathname.startsWith("/hidden-admin");

  return (
    <>
      {children}
      {showNav && <BottomTabBar />}
      {!isVendor && !isAdmin && <WhatsAppFloatingButton />}
    </>
  );
}
