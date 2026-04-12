"use client";

import { logo1 } from "@/assets/images";
import { MessageCircle, Phone, Mail } from "lucide-react";
import Link from "next/link";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function TikTokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.2 8.2 0 005.58 2.17V11.7a4.85 4.85 0 01-3.77-1.87V6.69h3.77z" />
    </svg>
  );
}

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function DesktopFooter() {
  return (
    <footer className="bg-[#1A2A3A] text-white pt-16 pb-0">
      <div className="max-w-6xl mx-auto px-8">
        {/* Logo & Social */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <img src={logo1.src} alt="MiMaji" className="h-[50px] w-auto brightness-0 invert" />
            <div>
              <p className="text-white/60 text-sm">Water delivered to your door in Nairobi. Fast, reliable, local.</p>
              <p className="text-white/40 text-xs mt-1">For every 100L delivered, 10L goes to rural communities.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://instagram.com/mimaji.co.ke" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors"><InstagramIcon size={18} /></a>
            <a href="https://x.com/mimaji" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors"><XIcon size={18} /></a>
            <a href="https://www.facebook.com/share/188pFxvtd1/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors"><FacebookIcon size={18} /></a>
            <a href="https://www.linkedin.com/company/mimaji" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors"><LinkedInIcon size={18} /></a>
            <a href="https://tiktok.com/@mimaji" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white transition-colors"><TikTokIcon size={18} /></a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 mb-12">
          {/* Column 1: Services */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide text-white/80">Services</h4>
            <div className="flex flex-col gap-2">
              <Link href="/buy" className="text-white/60 text-sm hover:text-white transition-colors">Order Water</Link>
              <Link href="/products" className="text-white/60 text-sm hover:text-white transition-colors">Our Products</Link>
              <Link href="/know-your-water" className="text-white/60 text-sm hover:text-white transition-colors">Know Your Water</Link>
              <Link href="/scan-qr-code" className="text-white/60 text-sm hover:text-white transition-colors">Scan QR Code</Link>
              <Link href="/orders" className="text-white/60 text-sm hover:text-white transition-colors">My Orders</Link>
              <Link href="/subscriptions" className="text-white/60 text-sm hover:text-white transition-colors">Subscriptions</Link>
              <Link href="/rewards" className="text-white/60 text-sm hover:text-white transition-colors">Water Warriors Rewards</Link>
              <Link href="/schedule" className="text-white/60 text-sm hover:text-white transition-colors">Schedule Delivery</Link>
              <Link href="/corporate" className="text-white/60 text-sm hover:text-white transition-colors">Corporate Solutions</Link>
            </div>
          </div>
          {/* Column 2: Company */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide text-white/80">Company</h4>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-white/60 text-sm hover:text-white transition-colors">About Us</Link>
              <Link href="/impact" className="text-white/60 text-sm hover:text-white transition-colors">Our Impact</Link>
              <a href="http://mimaji.org/" target="_blank" rel="noopener noreferrer" className="text-white/60 text-sm hover:text-white transition-colors">MiMaji Foundation</a>
              <Link href="/vendors" className="text-white/60 text-sm hover:text-white transition-colors">Vendor Map</Link>
              <Link href="/water-guide" className="text-white/60 text-sm hover:text-white transition-colors">Water Guide</Link>
              <Link href="/blog" className="text-white/60 text-sm hover:text-white transition-colors">Blog</Link>
              <Link href="/vendor-login" className="text-white/60 text-sm hover:text-white transition-colors">Vendor Login</Link>
              <Link href="/vendor-signup" className="text-[#2ECC71] text-sm font-semibold hover:text-[#27ae60] transition-colors">Sign Up as Vendor</Link>
            </div>
          </div>
          {/* Column 3: Help & Contact */}
          <div>
            <h4 className="font-bold text-sm mb-4 uppercase tracking-wide text-white/80">Help & Contact</h4>
            <div className="flex flex-col gap-2">
              <Link href="/support" className="text-white/60 text-sm hover:text-white transition-colors">Help & Support</Link>
              <Link href="/contact" className="text-white/60 text-sm hover:text-white transition-colors">Contact Us</Link>
              <a href="https://wa.me/254704476338" target="_blank" rel="noopener noreferrer" className="text-[#25D366] text-sm font-semibold hover:text-[#1fb855] transition-colors flex items-center gap-2">
                <MessageCircle size={14} />
                WhatsApp (24/7)
              </a>
              <a href="tel:+254704476338" className="text-white/60 text-sm hover:text-white transition-colors flex items-center gap-2">
                <Phone size={14} />
                +254 704 476 338
              </a>
              <a href="mailto:support@mimaji.co.ke" className="text-white/60 text-sm hover:text-white transition-colors flex items-center gap-2">
                <Mail size={14} />
                support@mimaji.co.ke
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 pt-6 pb-6">
          <div className="flex items-center gap-6 mb-4">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wide font-semibold mb-1">M-PESA Payment</p>
              <p className="text-white/80 text-sm">Send Money To: <span className="font-bold text-white">0704476338</span></p>
              <p className="text-white/60 text-xs mt-1">Paste your M-PESA confirmation code so we can track your order.</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 pt-6 pb-6 flex items-center justify-between">
          <p className="text-white/40 text-xs">&copy; 2026 MiMaji. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-white/40 text-xs hover:text-white/70 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-white/40 text-xs hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/cancellation" className="text-white/40 text-xs hover:text-white/70 transition-colors">Refunds</Link>
            <Link href="/cookies" className="text-white/40 text-xs hover:text-white/70 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
