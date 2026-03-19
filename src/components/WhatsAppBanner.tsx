"use client";

/* eslint-disable @next/next/no-img-element */

const WHATSAPP_LINK = "https://wa.me/254758434076";

/**
 * Mobile: Static full-width WhatsApp banner (place inline in page flow).
 * Desktop: Floating circle button in bottom-right corner.
 */
export function WhatsAppMobileBanner() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[#25D366] rounded-xl p-4 mb-5 md:hidden"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0">
          <img
            src="/WhatsApp.svg.webp"
            alt="WhatsApp"
            width={30}
            height={30}
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">24/7 Service Available</p>
          <p className="text-white/80 text-xs">Chat with us on WhatsApp</p>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
    </a>
  );
}

export default function WhatsAppFloatingButton() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden md:flex fixed bottom-8 right-8 z-30 w-14 h-14 bg-[#25D366] rounded-full items-center justify-center shadow-lg hover:bg-[#1fb855] transition-all hover:scale-110 group"
      title="Chat on WhatsApp"
    >
      <img
        src="/WhatsApp.svg.webp"
        alt="WhatsApp"
        width={32}
        height={32}
        className="object-contain"
      />
      <span className="absolute right-full mr-3 bg-surface text-text-primary text-xs font-semibold px-3 py-1.5 rounded-lg shadow-card whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Chat with us
      </span>
    </a>
  );
}
