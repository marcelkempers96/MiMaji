"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A link that redirects to login if the user is not authenticated.
 * After login, the user is redirected back to the original destination.
 */
export default function AuthLink({ href, children, className }: AuthLinkProps) {
  const { user } = useAuth();
  const destination = user ? href : `/login?redirect=${encodeURIComponent(href)}`;

  return (
    <Link href={destination} className={className}>
      {children}
    </Link>
  );
}
