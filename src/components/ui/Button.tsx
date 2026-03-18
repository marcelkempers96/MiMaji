"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "coral";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  fullWidth = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97]";

  const variants: Record<string, string> = {
    primary: "bg-primary text-white",
    outline: "border border-primary text-primary bg-transparent",
    ghost: "bg-transparent text-primary",
    coral: "bg-cta-alt text-white",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${base} ${variants[variant]} ${width} ${className} px-6`}
      {...props}
    >
      {children}
    </button>
  );
}
