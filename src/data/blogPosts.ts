export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedDate: string;
  readingTime: string;
  category: string;
  heroImage?: string;
  content: BlogSection[];
}

export type BlogSection =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "subheading"; text: string };

export const blogPosts: BlogPost[] = [
  {
    slug: "is-nairobi-tap-water-safe-to-drink-2026",
    title: "Is Nairobi Tap Water Safe to Drink in 2026? What the Data Actually Says",
    excerpt:
      "If you live in Nairobi, you have probably asked yourself this question at least once: can I drink the water from my tap? We break down the real data so you can make an informed decision.",
    author: "MiMaji Research Team",
    publishedDate: "March 2026",
    readingTime: "12 min read",
    category: "Water Safety",
    content: [
      {
        type: "paragraph",
        text: "If you live in Nairobi, you have probably asked yourself this question at least once: can I drink the water from my tap? The answer, like most things in this city, is complicated. It depends on where you live, when you turn on the tap, and whether the water has actually been treated before it reaches your glass. In this blog, we break down the real data so you can make an informed decision about the water your family drinks every day.",
      },
      {
        type: "heading",
        text: "Nairobi\u2019s Water Supply: The Basics",
      },
      {
        type: "paragraph",
        text: "Nairobi\u2019s water comes primarily from three sources: the Thika Dam system (which includes the Ndakaini Dam, supplying about 85% of the city\u2019s treated water), the Sasumua Dam in Nyandarua County (contributing roughly 11%), and the Ruiru Dam. The raw water from these sources is treated at the Ng\u2019ethu Water Treatment Plant and then pushed through hundreds of kilometres of distribution pipes to reach homes across the city.",
      },
      {
        type: "paragraph",
        text: "Here is the fundamental problem: Nairobi\u2019s daily water demand has ballooned to over 900 million litres per day, while the available supply sits at approximately 525 million litres. That is a deficit of nearly 375 million litres every single day. This gap means that water is rationed, with many estates receiving piped water only a few days per week \u2014 or not at all.",
      },
      {
        type: "heading",
        text: "What the KEBS Standards Say About Drinking Water",
      },
      {
        type: "paragraph",
        text: "The Kenya Bureau of Standards (KEBS) has established clear standards for potable (drinking) water under KS EAS 153. These standards set maximum allowable limits for a range of parameters including turbidity, pH levels, bacterial contamination (E. coli, total coliforms), heavy metals (lead, arsenic, cadmium), and chemical residues. The standards align closely with World Health Organization (WHO) guidelines but are adapted for Kenyan conditions.",
      },
      {
        type: "paragraph",
        text: "For water to be considered safe for human consumption under KEBS standards, it must meet all of the following minimum thresholds:",
      },
      {
        type: "table",
        headers: ["Parameter", "KEBS Maximum Limit", "WHO Guideline", "What It Means"],
        rows: [
          ["Turbidity", "5 NTU (max 25 NTU)", "< 1 NTU ideal", "Cloudiness of water; high turbidity can hide bacteria"],
          ["pH", "6.5 \u2013 8.5", "6.5 \u2013 8.5", "Acidity level; outside range corrodes pipes"],
          ["E. coli", "0 per 100ml", "0 per 100ml", "Presence means fecal contamination"],
          ["Total Coliforms", "0 per 100ml", "0 per 100ml", "Indicator of overall bacterial contamination"],
          ["Lead", "0.01 mg/L", "0.01 mg/L", "Toxic heavy metal from old pipes"],
          ["Residual Chlorine", "0.2 \u2013 0.5 mg/L", "0.2 \u2013 5 mg/L", "Disinfection; too little = bacteria survive"],
          ["Total Dissolved Solids", "1,500 mg/L max", "1,000 mg/L", "Overall mineral/salt content"],
        ],
      },
      {
        type: "paragraph",
        text: "When water leaves the Ng\u2019ethu Treatment Plant, it generally meets these standards. The problem is what happens between the treatment plant and your tap.",
      },
      {
        type: "heading",
        text: "The Journey from Treatment Plant to Your Glass: Where Contamination Happens",
      },
      {
        type: "paragraph",
        text: "Nairobi\u2019s water distribution network is old. Some pipes date back to the colonial era \u2014 over 60 years old. These aging pipes are prone to cracks, leaks, and corrosion. When a pipe cracks underground, two things happen: treated water leaks out (contributing to the 40% or more of \u201cnon-revenue water\u201d that NCWSC loses), and contaminants from the surrounding soil can seep in.",
      },
      {
        type: "paragraph",
        text: "The contamination risk increases dramatically in several scenarios:",
      },
      {
        type: "paragraph",
        text: "First, during water rationing. When NCWSC turns off supply to an area, the pressure in the pipes drops to zero. This creates negative pressure that can suck soil, sewage, and groundwater into the pipes through cracks and joints. When supply resumes, this contaminated water is pushed into homes alongside the treated water. Residents often notice brown, murky water for the first few minutes after supply returns \u2014 this is not just \u201crust,\u201d it is contamination.",
      },
      {
        type: "paragraph",
        text: "Second, during floods and heavy rains. The March 2026 floods in Nairobi provide a stark example. Heavy downpours damaged the major transmission pipeline along Outering Road, which supplies water to over 15 estates including Buruburu, Kariobangi, Dandora, Mathare, Eastleigh, and Korogocho. Floodwater carrying sewage, debris, and soil overwhelmed the broken pipes. Even after repairs, the flushing process takes days, and contaminated water can persist in the system.",
      },
      {
        type: "paragraph",
        text: "Third, through illegal connections. Water cartels and individuals illegally tap into main distribution lines using crude methods that breach the pipe\u2019s integrity. These connections are rarely sealed properly, creating permanent entry points for contamination. In informal settlements, illegal connections may run alongside or even through open sewage channels.",
      },
      {
        type: "heading",
        text: "Estate-by-Estate Reality: Not All Nairobi Water Is Equal",
      },
      {
        type: "paragraph",
        text: "Water quality in Nairobi varies enormously depending on where you live. Estates closer to the main treatment works and on newer distribution networks (such as parts of Westlands, Kilimani, and Kileleshwa) tend to receive better-quality water. Estates further from treatment plants, on older pipe networks, or in informal settlements face significantly worse quality.",
      },
      {
        type: "paragraph",
        text: "Recent studies and NCWSC data suggest the following patterns:",
      },
      {
        type: "table",
        headers: ["Area Type", "Examples", "Typical Water Quality", "Key Risks"],
        rows: [
          ["Newer/Central Estates", "Kilimani, Kileleshwa, Lavington", "Generally meets KEBS standards when available", "Quality drops during rationing; intermittent supply"],
          ["Older Eastlands Estates", "Buruburu, Umoja, Dandora, Komarock", "Variable; frequent turbidity issues", "Aging pipes; affected by March 2026 flood damage"],
          ["Informal Settlements", "Kibera, Mathare, Korogocho, Mukuru", "Often fails KEBS standards", "Illegal connections near sewage; no residual chlorine; vendor water unregulated"],
          ["Satellite Towns", "Ruiru, Kitengela, Ongata Rongai", "Mostly borehole-dependent", "Fluoride, nitrates, bacterial contamination from pit latrines"],
        ],
      },
      {
        type: "heading",
        text: "The Health Consequences: What Contaminated Water Does to Your Family",
      },
      {
        type: "paragraph",
        text: "Drinking contaminated water is not a minor inconvenience \u2014 it is a serious health risk. Kenya reports thousands of typhoid fever cases annually, with Nairobi being a consistent hotspot. Cholera outbreaks continue to occur, particularly in informal settlements where water and sanitation infrastructure is weakest. Dysentery, hepatitis A, and parasitic infections (cryptosporidium, giardia) are all transmitted through contaminated water.",
      },
      {
        type: "paragraph",
        text: "Children under five are the most vulnerable. The World Health Organization estimates that diarrheal diseases \u2014 most of which are caused by contaminated water \u2014 are the second leading cause of death in children under five globally. In Nairobi\u2019s informal settlements, where families rely on unregulated water vendors, the risk is compounded by the use of unsanitary storage containers.",
      },
      {
        type: "paragraph",
        text: "Even in middle-class estates, the health cost of intermittent water supply is real. A study in Nairobi found that households in areas with intermittent supply reported significantly more gastrointestinal illness than those with continuous supply \u2014 even when the source water was technically treated.",
      },
      {
        type: "heading",
        text: "So, Is It Safe to Drink? The Honest Answer",
      },
      {
        type: "paragraph",
        text: "The honest answer is: it depends, and you should not assume it is safe.",
      },
      {
        type: "paragraph",
        text: "If you live in a well-maintained estate with relatively new pipes and you have continuous (not rationed) water supply, your tap water is more likely to meet KEBS standards. But even then, the only way to be certain is to have it tested.",
      },
      {
        type: "paragraph",
        text: "If you experience intermittent supply (which is the reality for most Nairobians), your tap water is at higher risk of contamination every time supply resumes. The first water that comes through after a dry spell is almost certainly compromised.",
      },
      {
        type: "paragraph",
        text: "If you live in an informal settlement or rely on water from vendors, boreholes, or tankers, you should treat all water before drinking \u2014 or better yet, source it from KEBS-certified suppliers.",
      },
      {
        type: "heading",
        text: "What You Can Do: Practical Steps to Protect Your Family",
      },
      {
        type: "paragraph",
        text: "Step one: If you use tap water for drinking, boil it. Bringing water to a rolling boil for at least one minute kills virtually all bacterial and viral pathogens. This is the simplest and most effective treatment method available to any household.",
      },
      {
        type: "paragraph",
        text: "Step two: Use water treatment products. WaterGuard (sodium hypochlorite solution) is widely available in Nairobi supermarkets and dukas. It costs approximately KSh 30\u201350 and treats hundreds of litres. Follow the instructions on the bottle: typically 1 capful per 20 litres, wait 30 minutes before drinking.",
      },
      {
        type: "paragraph",
        text: "Step three: If you can afford it, invest in a household water filter. Ceramic filters (like those made by Aqua Clara Kenya) cost between KSh 3,000 and KSh 8,000 and remove bacteria and turbidity effectively. Reverse osmosis systems provide the highest level of purification but cost KSh 15,000 or more.",
      },
      {
        type: "paragraph",
        text: "Step four: Order from verified, KEBS-certified water suppliers. This is where MiMaji comes in. Every supplier on the MiMaji platform is required to hold a valid KEBS Standardization Mark. We verify their Public Health Hygiene License, Medical Certificates, County Business License, and water quality test results. Suppliers who fail quarterly quality audits are immediately removed from the platform.",
      },
      {
        type: "paragraph",
        text: "Step five: Never store drinking water in containers previously used for chemicals, oil, or other non-food substances. Use food-grade containers, keep them covered, and replace stored water every 48 to 72 hours.",
      },
      {
        type: "heading",
        text: "How MiMaji Ensures Your Water Is Safe",
      },
      {
        type: "paragraph",
        text: "MiMaji was built specifically to solve the trust problem in Nairobi\u2019s water supply chain. When you order through MiMaji, you are not getting water from an unknown vendor with a handcart and questionable source. You are getting water from a verified, KEBS-certified supplier whose treatment facility has been inspected, whose water has been lab-tested, and whose hygiene practices have been confirmed.",
      },
      {
        type: "paragraph",
        text: "Every MiMaji delivery comes with transparency: you can see which supplier filled your jug, their KEBS certification status, and their quality rating from other customers. If any delivery does not meet your expectations, our quality guarantee ensures a replacement within 24 hours.",
      },
      {
        type: "paragraph",
        text: "In a city where the tap is unreliable and the vendor is unverified, MiMaji gives you certainty. Clean water, tested water, delivered to your door, paid via M-Pesa. No queuing, no guessing, no risk.",
      },
    ],
  },
  {
    slug: "real-cost-of-water-in-nairobi-2026",
    title: "The Real Cost of Water in Nairobi: What Every Estate Pays (2026 Prices)",
    excerpt:
      "Water is supposed to be a basic human right. But in Nairobi, the price you pay depends almost entirely on your postcode. A Runda family pays KSh 2 per 20L while a Kibera family pays up to KSh 100.",
    author: "MiMaji Research Team",
    publishedDate: "March 2026",
    readingTime: "10 min read",
    category: "Water Pricing",
    content: [
      {
        type: "paragraph",
        text: "Water is supposed to be a basic human right. Article 43(d) of Kenya\u2019s Constitution guarantees every citizen the right to clean and safe water in adequate quantities. But in Nairobi, the price you pay for water depends almost entirely on your postcode. A family in Runda might pay KSh 2 per 20 litres from their municipal connection. A family in Kibera might pay KSh 50 to KSh 100 for the same amount from a vendor. That is a 25-to-50-fold difference for the same basic necessity.",
      },
      {
        type: "paragraph",
        text: "This blog presents the real, current prices that Nairobi residents pay for water across different estates and through different channels. The data comes from field surveys, NCWSC published tariffs, WASREB reports, and first-hand accounts from MiMaji\u2019s supplier network.",
      },
      {
        type: "heading",
        text: "Understanding the Water Pricing Channels",
      },
      {
        type: "paragraph",
        text: "To understand Nairobi\u2019s water prices, you first need to understand the different ways water reaches households. Each channel has a different cost structure, quality level, and reliability profile.",
      },
      {
        type: "subheading",
        text: "Channel 1: NCWSC Piped Connection",
      },
      {
        type: "paragraph",
        text: "If you are lucky enough to have a working Nairobi City Water and Sewerage Company (NCWSC) connection, this is the cheapest source. NCWSC\u2019s approved tariff structure charges residential customers on a tiered basis: the first 6 cubic metres per month are charged at the lowest rate, with prices increasing for higher consumption. For a household using 10 to 15 cubic metres per month, the effective cost works out to approximately KSh 2 to KSh 5 per 20-litre equivalent.",
      },
      {
        type: "paragraph",
        text: "The catch: NCWSC supply is intermittent in most areas. Many estates receive water only 2 to 3 days per week. Some, like Ngumo Nera Estate, have reported no water since January 2026, prompting the Ombudsman to demand an explanation from NCWSC.",
      },
      {
        type: "subheading",
        text: "Channel 2: Water Kiosks and ATMs",
      },
      {
        type: "paragraph",
        text: "Water kiosks (including Jibu franchise points, Susteq ATMs, and NCWSC community standpipes) are the next cheapest option. Prices typically range from KSh 5 to KSh 15 per 20 litres, depending on location and operator. The water is usually treated and of reasonable quality, but you must physically travel to the kiosk, queue (often for 30 minutes or more), and carry the heavy jug home.",
      },
      {
        type: "subheading",
        text: "Channel 3: Borehole Water",
      },
      {
        type: "paragraph",
        text: "Many estates, particularly in satellite areas like Ruiru, Kitengela, and parts of Eastlands, rely on private boreholes. A 20-litre jerrycan from a borehole vendor costs KSh 10 to KSh 30. However, borehole water quality is highly variable. Without regular testing, borehole water may contain elevated fluoride, nitrates (from proximity to pit latrines), or bacterial contamination.",
      },
      {
        type: "subheading",
        text: "Channel 4: Vendor-Delivered Water (Boda Boda / Handcart)",
      },
      {
        type: "paragraph",
        text: "This is where prices spike dramatically. Water vendors using handcarts or boda bodas charge KSh 30 to KSh 100 per 20-litre jerrycan, depending on the estate, distance, and level of scarcity. During water shortages, prices can double or triple. In March 2026, with the Outering Road pipeline damaged by floods, residents in affected estates reported vendors charging up to KSh 100 per jerrycan.",
      },
      {
        type: "subheading",
        text: "Channel 5: Branded Bottled/Purified Water (20L Jugs)",
      },
      {
        type: "paragraph",
        text: "Branded 20-litre water jugs from companies like Highland, Keringet, Aquamist, or local purifiers cost between KSh 150 and KSh 350 per jug. These are KEBS-certified and offer the highest quality assurance, but the price puts them out of reach for daily household use for most Nairobi families.",
      },
      {
        type: "heading",
        text: "Estate-by-Estate Price Comparison: What You Actually Pay",
      },
      {
        type: "paragraph",
        text: "Here is a detailed breakdown of current water prices across Nairobi\u2019s major residential areas:",
      },
      {
        type: "table",
        headers: ["Estate / Area", "NCWSC Supply?", "Typical Price per 20L", "Primary Source", "Notes"],
        rows: [
          ["Runda / Muthaiga", "Yes (reliable)", "KSh 2\u20135", "NCWSC piped", "Boreholes as backup; rarely buy vendor water"],
          ["Karen / Lang\u2019ata", "Yes (intermittent)", "KSh 5\u201315", "NCWSC + borehole", "Many homes have own boreholes"],
          ["Kilimani / Kileleshwa", "Yes (intermittent)", "KSh 5\u201320", "NCWSC + kiosk", "Water tanks buffer supply gaps"],
          ["Westlands / Parklands", "Yes (intermittent)", "KSh 10\u201325", "NCWSC + vendors", "Affected by Sasumua shutdowns"],
          ["South B / South C", "Intermittent", "KSh 15\u201340", "Kiosk + vendors", "Growing vendor dependence"],
          ["Umoja / Kayole", "Intermittent", "KSh 20\u201350", "Kiosk + boda vendor", "Frequent rationing"],
          ["Buruburu", "Intermittent", "KSh 20\u201360", "Kiosk + vendor", "Severely hit by March 2026 floods"],
          ["Roysambu / Kasarani", "Intermittent", "KSh 20\u201350", "Borehole + vendor", "Borehole quality concerns"],
          ["Dandora / Kariobangi", "Intermittent/None", "KSh 30\u201380", "Vendor + kiosk", "Infrastructure frequently damaged"],
          ["Eastleigh", "Intermittent", "KSh 30\u201370", "Vendor", "Dense population, high demand"],
          ["Mathare", "Rare", "KSh 30\u2013100", "Vendor + illegal tap", "Informal connections; quality unknown"],
          ["Kibera", "Rare", "KSh 50\u2013100", "Vendor + kiosk", "Highest per-litre cost in the city"],
          ["Korogocho", "Rare", "KSh 40\u2013100", "Vendor", "Pipeline damage; price spikes common"],
          ["Ruiru / Juja", "Limited NCWSC", "KSh 15\u201340", "Borehole + tanker", "Borehole-dependent; quality variable"],
          ["Kitengela / Ongata Rongai", "No NCWSC", "KSh 20\u201350", "Borehole + tanker", "No municipal supply at all"],
        ],
      },
      {
        type: "heading",
        text: "The Inequality Math: The Poorest Pay the Most",
      },
      {
        type: "paragraph",
        text: "The data reveals a cruel irony that defines Nairobi\u2019s water landscape: the poorest residents pay the most for water. A family in Runda with a reliable NCWSC connection pays roughly KSh 2 per 20 litres. A family in Kibera pays KSh 50 to KSh 100 for the same volume from a vendor. That means a Kibera family pays 25 to 50 times more per litre than a Runda family.",
      },
      {
        type: "paragraph",
        text: "Put another way: if a Kibera family of four uses the recommended minimum of 200 litres per day (10 jerrycans), they could spend KSh 500 to KSh 1,000 per day on water alone. That is KSh 15,000 to KSh 30,000 per month \u2014 a catastrophic expense for families earning KSh 15,000 to KSh 30,000 total.",
      },
      {
        type: "paragraph",
        text: "This is not just a pricing problem. It is a poverty trap. Families who cannot afford vendor prices during shortages reduce their water consumption to dangerous levels. They skip handwashing, reuse cooking water, or drink from unverified sources. The health consequences \u2014 typhoid, diarrhoea, skin infections \u2014 then create additional medical costs that push them further into poverty.",
      },
      {
        type: "heading",
        text: "What Drives the Price Spikes?",
      },
      {
        type: "paragraph",
        text: "Water prices in Nairobi are not static. They fluctuate based on several factors:",
      },
      {
        type: "paragraph",
        text: "Supply interruptions are the primary driver. When NCWSC announces a shutdown (like the February 2026 Sasumua Dam maintenance or the March 2026 flood-related pipeline breaks), vendor prices in affected areas can double within hours. Vendors know that desperate families will pay.",
      },
      {
        type: "paragraph",
        text: "Seasonality also plays a role. During dry seasons, borehole yields drop, kiosks run out faster, and competition for available water intensifies. During floods, paradoxically, treatment plants shut down and pipes break, creating shortages even as water surrounds residents.",
      },
      {
        type: "paragraph",
        text: "Distance from water source matters. Vendors charge a premium for delivery distance. An estate that is 2 kilometres from the nearest kiosk will pay significantly more than one adjacent to a water point.",
      },
      {
        type: "paragraph",
        text: "Cartel activity inflates prices in some areas. Investigations have revealed organised water cartels that control supply in certain informal settlements, deliberately restricting supply from community water points to force residents to buy from their own vendors at inflated prices.",
      },
      {
        type: "heading",
        text: "How MiMaji Is Standardising Water Prices Across Nairobi",
      },
      {
        type: "paragraph",
        text: "MiMaji was built to break this inequality. On the MiMaji platform, the price you pay for a 20-litre jug of clean, KEBS-certified water does not depend on which estate you live in. We work directly with verified suppliers to negotiate fair, transparent pricing that is the same whether you are in South B or Roysambu, Umoja or Buruburu.",
      },
      {
        type: "paragraph",
        text: "By connecting customers directly with certified suppliers and handling delivery through our GPS-tracked rider network, MiMaji eliminates the middlemen and vendor cartels that inflate prices during shortages. You see the price before you order, pay via M-Pesa, and track your delivery in real time.",
      },
      {
        type: "paragraph",
        text: "For families currently paying KSh 50 to KSh 100 per jerrycan from vendors, switching to MiMaji can save hundreds or even thousands of shillings per month while guaranteeing water quality that unregulated vendors simply cannot match.",
      },
    ],
  },
  {
    slug: "how-to-order-water-delivery-nairobi-2026",
    title: "How to Order Water Delivery in Nairobi: 5 Options Compared (2026 Guide)",
    excerpt:
      "Your taps are dry. Again. What is the best way to get water delivered to your door in Nairobi in 2026? We compare all five major options \u2014 from boda bodas to apps.",
    author: "MiMaji Research Team",
    publishedDate: "March 2026",
    readingTime: "10 min read",
    category: "Guides",
    content: [
      {
        type: "paragraph",
        text: "Your taps are dry. Again. You need water for your family, and you need it today. But what is the best way to get water delivered to your door in Nairobi in 2026? The options range from the traditional (calling your neighbourhood boda boda guy) to the modern (ordering through a mobile app). Each has its own trade-offs in terms of price, quality, speed, and reliability.",
      },
      {
        type: "paragraph",
        text: "This guide compares all five major water delivery options available to Nairobi residents, with honest assessments of each so you can choose what works best for your situation.",
      },
      {
        type: "heading",
        text: "Option 1: The Boda Boda / Informal Vendor",
      },
      {
        type: "subheading",
        text: "How It Works",
      },
      {
        type: "paragraph",
        text: "You call or WhatsApp a boda boda rider you know (or one recommended by your caretaker/neighbour). You tell them how many jerrycans you need. They go to the nearest water kiosk, borehole, or water point, fill up, and ride to your home. You pay cash on delivery.",
      },
      {
        type: "subheading",
        text: "Pricing",
      },
      {
        type: "paragraph",
        text: "KSh 30 to KSh 100 per 20-litre jerrycan, depending on estate, distance, and scarcity. Prices are negotiable but spike dramatically during shortages. There is no standardised pricing \u2014 the rider charges what they think you will pay.",
      },
      {
        type: "subheading",
        text: "Water Quality",
      },
      {
        type: "paragraph",
        text: "This is the biggest risk. You have no idea where the rider actually sourced the water. They might go to a KEBS-certified kiosk, or they might fill up from an unregistered borehole near a pit latrine. The jerrycans are often reused containers that previously held cooking oil, chemicals, or fuel. There is no quality testing, no certification, and no accountability.",
      },
      {
        type: "subheading",
        text: "Reliability",
      },
      {
        type: "paragraph",
        text: "Depends entirely on the rider\u2019s availability. Your regular guy might be busy, unreachable, or have raised his prices. During major shortages, riders prioritise higher-paying customers. You might wait hours or not get water at all.",
      },
      {
        type: "subheading",
        text: "Verdict",
      },
      {
        type: "paragraph",
        text: "Cheap and accessible, but a gamble on quality and reliability. Best as a last resort, not a primary water source.",
      },
      {
        type: "heading",
        text: "Option 2: NCWSC Bowser Service",
      },
      {
        type: "subheading",
        text: "How It Works",
      },
      {
        type: "paragraph",
        text: "Nairobi Water offers emergency bowser delivery. You dial *260# on your phone and select Option 5 to request a water bowser. NCWSC dispatches a tanker truck to your area. This service was heavily promoted during the March 2026 pipeline repairs.",
      },
      {
        type: "subheading",
        text: "Pricing",
      },
      {
        type: "paragraph",
        text: "NCWSC bowser rates are subsidised and significantly cheaper than private vendors. However, exact pricing depends on volume and location. The service is designed for bulk delivery (minimum 1,000 litres), making it more suitable for apartment buildings or community groups than individual households.",
      },
      {
        type: "subheading",
        text: "Water Quality",
      },
      {
        type: "paragraph",
        text: "NCWSC bowser water comes from the utility\u2019s treated supply, so quality is generally reliable. However, the bowser tanks themselves may not always be cleaned between deliveries, and the water is not individually tested before each delivery.",
      },
      {
        type: "subheading",
        text: "Reliability",
      },
      {
        type: "paragraph",
        text: "This is the weakest point. NCWSC has limited bowser capacity for a city of over 5 million. During major disruptions (like the March 2026 floods that affected 15+ estates simultaneously), demand overwhelms supply. Wait times can stretch to days. The service is an emergency measure, not a reliable daily solution.",
      },
      {
        type: "subheading",
        text: "Verdict",
      },
      {
        type: "paragraph",
        text: "Good for emergencies and bulk needs, but too slow and unpredictable for regular household use.",
      },
      {
        type: "heading",
        text: "Option 3: Handcart Water Vendors",
      },
      {
        type: "subheading",
        text: "How It Works",
      },
      {
        type: "paragraph",
        text: "Handcart vendors push carts loaded with 4 to 8 jerrycans of water through estates, selling door-to-door. They are a fixture of Nairobi\u2019s informal economy, particularly in Eastlands estates and informal settlements. Some operate from fixed water points; others roam through neighbourhoods.",
      },
      {
        type: "subheading",
        text: "Pricing",
      },
      {
        type: "paragraph",
        text: "KSh 20 to KSh 50 per 20 litres in normal times, rising to KSh 60 to KSh 100 during shortages. Handcart vendors are generally cheaper than boda boda delivery because their transport costs are lower (human labour vs. fuel).",
      },
      {
        type: "subheading",
        text: "Water Quality",
      },
      {
        type: "paragraph",
        text: "Variable and largely unregulated. Many handcart vendors source from private boreholes of unknown quality. The open-air transport exposes water to dust, insects, and airborne contaminants. Jerrycans are rarely sanitised between fills. Studies in Nairobi\u2019s informal settlements have found that vendor-delivered water frequently fails KEBS and WHO standards for bacterial contamination.",
      },
      {
        type: "subheading",
        text: "Reliability",
      },
      {
        type: "paragraph",
        text: "Handcart vendors are surprisingly reliable \u2014 they operate rain or shine because it is their livelihood. However, you cannot schedule deliveries or predict exactly when they will pass through your area. During shortages, they sell out quickly, and latecomers get nothing.",
      },
      {
        type: "subheading",
        text: "Verdict",
      },
      {
        type: "paragraph",
        text: "Affordable and accessible in many estates, but water quality is a serious concern. Suitable for non-drinking uses (cleaning, laundry) but risky for drinking.",
      },
      {
        type: "heading",
        text: "Option 4: PowWater (App-Based Competitor)",
      },
      {
        type: "subheading",
        text: "How It Works",
      },
      {
        type: "paragraph",
        text: "PowWater is a Nairobi-based water delivery app that connects customers with clean water suppliers. You download the app, create an account, select your location, and order water for delivery. The company markets itself as providing quality-tested water through its distribution network.",
      },
      {
        type: "subheading",
        text: "Pricing",
      },
      {
        type: "paragraph",
        text: "PowWater\u2019s pricing varies by location and volume. The app provides upfront pricing before you confirm your order. Generally competitive with mid-range vendor pricing.",
      },
      {
        type: "subheading",
        text: "Water Quality",
      },
      {
        type: "paragraph",
        text: "PowWater emphasises water quality testing in its marketing, stating that water is quality-tested before distribution. They work with established water points and purification systems.",
      },
      {
        type: "subheading",
        text: "Reliability",
      },
      {
        type: "paragraph",
        text: "As an app-based service, PowWater offers more predictable delivery than informal vendors. However, coverage is limited to certain areas of Nairobi, and availability can be constrained during high-demand periods.",
      },
      {
        type: "subheading",
        text: "Verdict",
      },
      {
        type: "paragraph",
        text: "A solid technology-driven option, but coverage and availability limitations may affect some users. Worth checking if they serve your specific estate.",
      },
      {
        type: "heading",
        text: "Option 5: MiMaji",
      },
      {
        type: "subheading",
        text: "How It Works",
      },
      {
        type: "paragraph",
        text: "MiMaji is a water delivery app designed specifically for Nairobi\u2019s unique challenges. Download the app, sign up with your phone number, select your delivery address, choose how many 20-litre jugs you want, and pay via M-Pesa STK Push. A GPS-tracked rider picks up your water from the nearest KEBS-certified supplier and delivers it to your door. You can rate the delivery and the water quality.",
      },
      {
        type: "subheading",
        text: "Pricing",
      },
      {
        type: "paragraph",
        text: "MiMaji offers standardised, transparent pricing across all serviced estates. You see the exact price before ordering \u2014 no negotiation, no surge pricing, no surprises. First-time users get a discount on their first jug. Subscription plans for weekly delivery offer further savings.",
      },
      {
        type: "subheading",
        text: "Water Quality",
      },
      {
        type: "paragraph",
        text: "This is MiMaji\u2019s core differentiator. Every supplier on the platform must hold a valid KEBS Standardization Mark. Suppliers are required to provide lab test results, maintain hygiene licences, and pass MiMaji\u2019s own quarterly quality audits. Any supplier that fails testing is immediately de-listed. You can see your supplier\u2019s certification status and customer ratings before ordering.",
      },
      {
        type: "subheading",
        text: "Reliability",
      },
      {
        type: "paragraph",
        text: "MiMaji\u2019s multi-supplier model means that if one supplier is out of stock, your order is automatically routed to the next nearest verified supplier. Real-time GPS tracking lets you see exactly when your delivery will arrive. During shortages, MiMaji\u2019s supplier network provides buffer capacity that single-source services cannot match.",
      },
      {
        type: "subheading",
        text: "Verdict",
      },
      {
        type: "paragraph",
        text: "The most transparent, quality-assured, and technologically complete water delivery option in Nairobi. Ideal for households and offices that prioritise water safety and convenience.",
      },
      {
        type: "heading",
        text: "The Decision Matrix: Which Option Is Right for You?",
      },
      {
        type: "table",
        headers: ["Factor", "Boda Vendor", "NCWSC Bowser", "Handcart", "PowWater", "MiMaji"],
        rows: [
          ["Price", "\u2b50\u2b50\u2b50", "\u2b50\u2b50\u2b50\u2b50\u2b50", "\u2b50\u2b50\u2b50\u2b50", "\u2b50\u2b50\u2b50", "\u2b50\u2b50\u2b50\u2b50"],
          ["Water Quality", "\u2b50", "\u2b50\u2b50\u2b50\u2b50", "\u2b50\u2b50", "\u2b50\u2b50\u2b50\u2b50", "\u2b50\u2b50\u2b50\u2b50\u2b50"],
          ["Reliability", "\u2b50\u2b50", "\u2b50\u2b50", "\u2b50\u2b50\u2b50", "\u2b50\u2b50\u2b50", "\u2b50\u2b50\u2b50\u2b50"],
          ["Speed", "\u2b50\u2b50\u2b50\u2b50", "\u2b50", "\u2b50\u2b50\u2b50", "\u2b50\u2b50\u2b50", "\u2b50\u2b50\u2b50\u2b50"],
          ["Transparency", "\u2b50", "\u2b50\u2b50", "\u2b50", "\u2b50\u2b50\u2b50", "\u2b50\u2b50\u2b50\u2b50\u2b50"],
          ["M-Pesa Payment", "\u274c", "\u274c", "\u274c", "\u2705", "\u2705"],
          ["GPS Tracking", "\u274c", "\u274c", "\u274c", "\u2705", "\u2705"],
          ["KEBS Certified", "\u274c", "\u2705", "\u274c", "\u2705", "\u2705"],
        ],
      },
      {
        type: "heading",
        text: "The Bottom Line",
      },
      {
        type: "paragraph",
        text: "There is no single perfect solution for every Nairobi household. Your choice depends on your budget, your location, and how much you value water quality and convenience.",
      },
      {
        type: "paragraph",
        text: "If budget is your only concern, NCWSC piped water (when available) or a handcart vendor will be cheapest. But if you care about what your family is actually drinking \u2014 and you should \u2014 then investing in verified, quality-assured water from MiMaji is not an expense. It is protection.",
      },
      {
        type: "paragraph",
        text: "The average Nairobi household spends KSh 3,000 to KSh 10,000 per month on water from various sources anyway. Redirecting even a portion of that spend to MiMaji\u2019s certified, transparent, convenient delivery means better water at a comparable or lower cost \u2014 with zero guesswork.",
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}
