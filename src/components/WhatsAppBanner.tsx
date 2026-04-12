"use client";

const WHATSAPP_LINK = "https://wa.me/254704476338";

function WhatsAppIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 175.216 175.552" className={className}>
      <defs>
        <linearGradient id="wa-b" x1="85.915" x2="86.535" y1="32.567" y2="137.092" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#57d163"/>
          <stop offset="1" stopColor="#23b33a"/>
        </linearGradient>
      </defs>
      <path d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 008.165 30.571l-8.677 31.693 32.467-8.518a61.1 61.1 0 0029.21 7.44h.025c33.72 0 61.154-27.426 61.166-61.14a60.75 60.75 0 00-17.903-43.248 60.75 60.75 0 00-43.275-17.928z" fill="url(#wa-b)"/>
      <path fill="#fff" fillRule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"/>
    </svg>
  );
}

/**
 * Mobile: Static full-width WhatsApp banner (place inline in page flow).
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
          <WhatsAppIcon size={28} />
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

/**
 * Desktop: Floating circle button in bottom-right corner.
 */
export default function WhatsAppFloatingButton() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden md:flex fixed bottom-8 right-8 z-30 w-14 h-14 bg-[#25D366] rounded-full items-center justify-center shadow-lg hover:bg-[#1fb855] transition-all hover:scale-110 group"
      title="Chat on WhatsApp"
    >
      <WhatsAppIcon size={30} />
      <span className="absolute right-full mr-3 bg-surface text-text-primary text-xs font-semibold px-3 py-1.5 rounded-lg shadow-card whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Chat with us
      </span>
    </a>
  );
}
