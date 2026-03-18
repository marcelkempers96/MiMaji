"use client";

import { usePathname } from "next/navigation";
import BottomTabBar from "./BottomTabBar";

const HIDE_NAV_ROUTES = ["/login", "/confirm", "/track"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !HIDE_NAV_ROUTES.includes(pathname);

  return (
    <>
      {children}
      {showNav && <BottomTabBar />}
    </>
  );
}
