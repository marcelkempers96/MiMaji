export type Lang = "en" | "sw";

const translations: Record<string, Record<Lang, string>> = {
  // Navbar
  "nav.kiosks": { en: "Water Kiosks", sw: "Vibanda vya Maji" },
  "nav.rider": { en: "Become a Rider", sw: "Kuwa Msambazaji" },
  "nav.provider": { en: "List Your Kiosk", sw: "Sajili Kibanda" },
  "nav.orders": { en: "My Orders", sw: "Oda Zangu" },
  "nav.track": { en: "Track My Water", sw: "Fuatilia Maji" },
  "nav.impact": { en: "Our Impact", sw: "Athari Yetu" },
  "nav.referrals": { en: "Refer & Earn", sw: "Shiriki & Pata" },
  "nav.login": { en: "Log In", sw: "Ingia" },
  "nav.signup": { en: "Sign Up", sw: "Jisajili" },
  "nav.distributor": { en: "Distributor Login", sw: "Msambazaji Ingia" },

  // Hero
  "hero.title": { en: "Fresh water,\ndelivered today.", sw: "Maji safi,\nyanaletwa leo." },
  "hero.subtitle": { en: "20-litre jugs · Nairobi · From KES 360", sw: "Mitungi ya lita 20 · Nairobi · Kuanzia KES 360" },

  // Order form
  "order.address": { en: "Delivery Address", sw: "Anwani ya Uwasilishaji" },
  "order.address_placeholder": { en: "e.g. Kilimani, Nairobi", sw: "mfano Kilimani, Nairobi" },
  "order.jugs": { en: "How many jugs?", sw: "Mitungi mingapi?" },
  "order.each": { en: "each", sw: "kila moja" },
  "order.phone": { en: "M-Pesa Number", sw: "Nambari ya M-Pesa" },
  "order.voucher": { en: "Have a voucher code?", sw: "Una kodi ya vocha?" },
  "order.voucher_placeholder": { en: "Enter voucher code", sw: "Ingiza kodi ya vocha" },
  "order.apply": { en: "Apply", sw: "Tumia" },
  "order.cta": { en: "Order & Pay via M-Pesa", sw: "Agiza & Lipa kwa M-Pesa" },
  "order.sending": { en: "Sending to your phone...", sw: "Inatumwa kwa simu..." },
  "order.secure": { en: "Secure", sw: "Salama" },
  "order.instant": { en: "Instant", sw: "Papo hapo" },
  "order.local": { en: "Local", sw: "Mtaa" },
  "order.delivery": { en: "Delivery fee", sw: "Ada ya uwasilishaji" },
  "order.free": { en: "FREE", sw: "BURE" },
  "order.total": { en: "Total", sw: "Jumla" },
  "order.savings": { en: "You save", sw: "Unaokoa" },
  "order.price_per": { en: "per jug", sw: "kwa mtungi" },

  // How it works
  "how.title": { en: "How it works", sw: "Inavyofanya kazi" },
  "how.step1": { en: "Order", sw: "Agiza" },
  "how.step1_desc": { en: "Pick quantity & address", sw: "Chagua idadi na anwani" },
  "how.step2": { en: "Pay", sw: "Lipa" },
  "how.step2_desc": { en: "M-Pesa STK Push", sw: "M-Pesa STK Push" },
  "how.step3": { en: "Receive", sw: "Pokea" },
  "how.step3_desc": { en: "Delivered to your door", sw: "Inafikishwa mlangoni" },

  // Footer
  "footer.about": { en: "About MiMaji", sw: "Kuhusu MiMaji" },
  "footer.contact": { en: "Contact Us", sw: "Wasiliana Nasi" },
  "footer.privacy": { en: "Privacy Policy", sw: "Sera ya Faragha" },
  "footer.terms": { en: "Terms of Service", sw: "Masharti ya Huduma" },
  "footer.faq": { en: "FAQ", sw: "Maswali" },
  "footer.language": { en: "Language", sw: "Lugha" },
  "footer.rights": { en: "All rights reserved.", sw: "Haki zote zimehifadhiwa." },
  "footer.impact": { en: "Our Impact", sw: "Athari Yetu" },
  "footer.tagline": { en: "Clean water for every Nairobi home", sw: "Maji safi kwa kila nyumba Nairobi" },

  // Promo
  "promo.title": { en: "Welcome to MiMaji! 💧", sw: "Karibu MiMaji! 💧" },
  "promo.first_order": { en: "Your first order comes with 5 litres FREE!", sw: "Oda yako ya kwanza inakuja na lita 5 BURE!" },
  "promo.referral_title": { en: "Refer friends, earn free water", sw: "Shiriki marafiki, pata maji bure" },
  "promo.referral_desc": {
    en: "For each friend you refer, you BOTH get 10 litres free. Invite 5 friends to earn up to 50 litres — and we'll top it up to 60 litres (3 free 20L jugs)!",
    sw: "Kwa kila rafiki unayesajili, WOTE WAWILI mnapata lita 10 bure. Alika marafiki 5 kupata hadi lita 50 — na tutaongeza hadi lita 60 (mitungi 3 ya 20L bure)!",
  },
  "promo.got_it": { en: "Got it!", sw: "Sawa!" },

  // Auth
  "auth.signup_title": { en: "Create your account", sw: "Fungua akaunti" },
  "auth.login_title": { en: "Welcome back", sw: "Karibu tena" },
  "auth.full_name": { en: "Full Name", sw: "Jina Kamili" },
  "auth.phone": { en: "Phone Number", sw: "Nambari ya Simu" },
  "auth.password": { en: "Password", sw: "Nenosiri" },
  "auth.confirm_password": { en: "Confirm Password", sw: "Thibitisha Nenosiri" },
  "auth.mpesa_same": { en: "This is also my M-Pesa number", sw: "Hii pia ni nambari yangu ya M-Pesa" },
  "auth.mpesa_number": { en: "M-Pesa Number", sw: "Nambari ya M-Pesa" },
  "auth.address": { en: "Default Delivery Address", sw: "Anwani ya Kawaida" },
  "auth.signup_btn": { en: "Create Account", sw: "Fungua Akaunti" },
  "auth.login_btn": { en: "Log In", sw: "Ingia" },
  "auth.have_account": { en: "Already have an account?", sw: "Tayari una akaunti?" },
  "auth.no_account": { en: "Don't have an account?", sw: "Huna akaunti?" },

  // Impact
  "impact.title": { en: "Our Impact", sw: "Athari Yetu" },
  "impact.subtitle": { en: "Every order makes a difference", sw: "Kila oda inaleta mabadiliko" },
  "impact.pledge": {
    en: "For every 100 litres ordered through MiMaji, we donate 5 litres to communities across Kenya facing severe drought and lack of water infrastructure.",
    sw: "Kwa kila lita 100 zinazoagizwa kupitia MiMaji, tunachangia lita 5 kwa jamii nchini Kenya zinazokabiliwa na ukame mkali na ukosefu wa miundombinu ya maji.",
  },

  // Track
  "track.title": { en: "Track My Water", sw: "Fuatilia Maji Yangu" },
  "track.arriving": { en: "Arriving in", sw: "Inafika kwa" },
  "track.minutes": { en: "minutes", sw: "dakika" },
  "track.rider": { en: "Your rider", sw: "Msambazaji wako" },
  "track.call": { en: "Call", sw: "Piga simu" },
};

export function t(key: string, lang: Lang = "en"): string {
  return translations[key]?.[lang] || key;
}

// Get/set language preference
export function getStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem("mimaji-lang") as Lang) || "en";
}

export function setStoredLang(lang: Lang): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("mimaji-lang", lang);
  }
}
