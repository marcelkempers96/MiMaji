"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

const WHATSAPP_LINK = "https://wa.me/254758434076";

export default function WhatsAppBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return <DesktopFloatingButton />;

  return (
    <>
      {/* Mobile: Full-width banner */}
      <div className="fixed bottom-16 left-0 right-0 z-30 md:hidden">
        <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 flex-1"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">24/7 Service Available</p>
              <p className="text-white/80 text-xs">Chat with us on WhatsApp</p>
            </div>
          </a>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/70 hover:text-white p-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Desktop: Floating circle button */}
      <DesktopFloatingButton />
    </>
  );
}

function DesktopFloatingButton() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden md:flex fixed bottom-8 right-8 z-30 w-14 h-14 bg-[#25D366] rounded-full items-center justify-center shadow-lg hover:bg-[#1fb855] transition-all hover:scale-110 group"
      title="Chat on WhatsApp"
    >
      <MessageCircle size={26} className="text-white" />
      <span className="absolute right-full mr-3 bg-surface text-text-primary text-xs font-semibold px-3 py-1.5 rounded-lg shadow-card whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Chat with us
      </span>
    </a>
  );
}
