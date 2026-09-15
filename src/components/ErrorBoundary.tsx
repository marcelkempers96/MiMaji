"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Keeps one broken card from taking down the whole page. Without this, a
 * render error anywhere in the admin analytics tab blanks the entire route
 * with "Application error: a client-side exception has occurred".
 */
export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode; label?: string },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode; label?: string }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[${this.props.label || "section"}] render failed:`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bg-surface shadow-card rounded-2xl p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFEBEE] flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-cta-alt" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-text-primary text-sm">
              {this.props.label || "This section"} could not load
            </h3>
            <p className="text-sm text-text-secondary mt-0.5">
              The rest of the page still works. Details are in the browser console.
            </p>
            <p className="text-xs text-text-secondary mt-1 font-mono break-words">
              {this.state.error.message}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
