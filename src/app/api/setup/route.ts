import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * POST /api/setup
 * Run database migrations and seed data using the service role client.
 * This endpoint is idempotent - safe to run multiple times.
 */
export async function POST() {
  const supabase = createServiceClient();

  // Test connection by checking if profiles table exists
  const { error: testError } = await supabase.from("profiles").select("id").limit(1);

  if (testError && testError.message.includes("relation")) {
    return NextResponse.json(
      {
        success: false,
        error: "Database tables not created yet. Please run the migration SQL in the Supabase SQL Editor first.",
        instructions: "Go to your Supabase Dashboard > SQL Editor and run the contents of supabase/migrations/ files in order (001 through 007).",
      },
      { status: 400 }
    );
  }

  // Seed vendors if none exist
  const { data: existingVendors } = await supabase.from("vendors").select("id").limit(1);

  if (!existingVendors || existingVendors.length === 0) {
    // Insert seed vendors
    const vendors = [
      {
        name: "AquaPure Kilimani",
        area: "Kilimani, Nairobi",
        rating: 4.8,
        reviews: 156,
        hours: "6AM - 9PM",
        products: ["20L Hard", "20L Soft", "10L Soft", "5L Soft"],
        brands: ["keringet", "aquamist"],
        areas_served: ["Kilimani", "Hurlingham", "Lavington", "Kileleshwa"],
        business_reg_no: "BN-2024-001234",
        mpesa_number: "254700111222",
        phone_numbers: ["+254700111222", "+254700111223"],
        active: true,
        verified: true,
      },
      {
        name: "WaterPoint Westlands",
        area: "Westlands, Nairobi",
        rating: 4.6,
        reviews: 89,
        hours: "7AM - 8PM",
        products: ["20L Hard", "20L Soft", "10L Soft"],
        brands: ["keringet", "mayers"],
        areas_served: ["Westlands", "Parklands", "Spring Valley", "Runda"],
        business_reg_no: "BN-2024-002345",
        mpesa_number: "254700222333",
        phone_numbers: ["+254700222333"],
        active: true,
        verified: true,
      },
      {
        name: "CleanWater Hub",
        area: "Lavington, Nairobi",
        rating: 4.9,
        reviews: 234,
        hours: "6AM - 10PM",
        products: ["20L Hard", "20L Soft", "10L Soft", "5L Soft"],
        brands: ["aquamist", "mayers", "keringet"],
        areas_served: ["Lavington", "Kileleshwa", "South C", "Nairobi West"],
        business_reg_no: "BN-2024-003456",
        mpesa_number: "254700333444",
        phone_numbers: ["+254700333444", "+254700333445"],
        active: true,
        verified: true,
      },
      {
        name: "Maji Fresh Karen",
        area: "Karen, Nairobi",
        rating: 4.7,
        reviews: 67,
        hours: "7AM - 9PM",
        products: ["20L Hard", "20L Soft"],
        brands: ["mayers"],
        areas_served: ["Karen", "Langata", "Rongai", "Ngong"],
        business_reg_no: "BN-2024-004567",
        mpesa_number: "254700444555",
        phone_numbers: ["+254700444555"],
        active: true,
        verified: true,
      },
      {
        name: "PureDrops CBD",
        area: "CBD, Nairobi",
        rating: 4.5,
        reviews: 112,
        hours: "6AM - 8PM",
        products: ["20L Soft", "10L Soft", "5L Soft"],
        brands: ["aquamist", "keringet"],
        areas_served: ["CBD", "Upper Hill", "South B", "Eastleigh"],
        business_reg_no: "BN-2024-005678",
        mpesa_number: "254700555666",
        phone_numbers: ["+254700555666", "+254700555667"],
        active: true,
        verified: true,
      },
    ];

    const { data: insertedVendors, error: vendorError } = await supabase
      .from("vendors")
      .insert(vendors)
      .select("id, name");

    if (vendorError) {
      return NextResponse.json({ success: false, error: `Failed to seed vendors: ${vendorError.message}` }, { status: 500 });
    }

    // Seed vendor locations
    const vendorLocations = [
      // AquaPure Kilimani
      { vendor_name: "AquaPure Kilimani", locations: [
        { name: "AquaPure Kilimani Main", area: "Kilimani, Nairobi", lat: -1.2921, lng: 36.7877 },
        { name: "AquaPure Hurlingham", area: "Hurlingham, Nairobi", lat: -1.2975, lng: 36.7950 },
      ]},
      // WaterPoint Westlands
      { vendor_name: "WaterPoint Westlands", locations: [
        { name: "WaterPoint Westlands", area: "Westlands, Nairobi", lat: -1.2673, lng: 36.8110 },
      ]},
      // CleanWater Hub
      { vendor_name: "CleanWater Hub", locations: [
        { name: "CleanWater Hub Lavington", area: "Lavington, Nairobi", lat: -1.2786, lng: 36.7718 },
        { name: "CleanWater Hub Kileleshwa", area: "Kileleshwa, Nairobi", lat: -1.2750, lng: 36.7810 },
        { name: "CleanWater Hub South C", area: "South C, Nairobi", lat: -1.3100, lng: 36.8250 },
      ]},
      // Maji Fresh Karen
      { vendor_name: "Maji Fresh Karen", locations: [
        { name: "Maji Fresh Karen", area: "Karen, Nairobi", lat: -1.3226, lng: 36.7126 },
      ]},
      // PureDrops CBD
      { vendor_name: "PureDrops CBD", locations: [
        { name: "PureDrops CBD", area: "CBD, Nairobi", lat: -1.2864, lng: 36.8172 },
        { name: "PureDrops Upperhill", area: "Upperhill, Nairobi", lat: -1.2950, lng: 36.8180 },
      ]},
    ];

    if (insertedVendors) {
      for (const vl of vendorLocations) {
        const vendor = insertedVendors.find((v) => v.name === vl.vendor_name);
        if (vendor) {
          await supabase.from("vendor_locations").insert(
            vl.locations.map((loc) => ({ ...loc, vendor_id: vendor.id }))
          );
        }
      }
    }
  }

  // Check vouchers
  const { data: existingVouchers } = await supabase.from("vouchers").select("id").limit(1);
  if (!existingVouchers || existingVouchers.length === 0) {
    await supabase.from("vouchers").insert([
      { code: "WELCOME10", description: "10% off your first order", discount_type: "percentage", discount_value: 10, min_order_litres: 0, max_uses: null, valid_until: "2027-12-31" },
      { code: "FREEDELIVERY", description: "Free delivery on orders 20L+", discount_type: "free_delivery", discount_value: 0, min_order_litres: 20, max_uses: null, valid_until: "2027-12-31" },
      { code: "MAJI5L", description: "5 free litres on orders 20L+", discount_type: "free_litres", discount_value: 5, min_order_litres: 20, max_uses: 500, valid_until: "2026-12-31" },
    ]);
  }

  return NextResponse.json({
    success: true,
    message: "Database setup complete. Vendors and vouchers seeded.",
    vendors: (existingVendors?.length || 0) > 0 ? "Already existed" : "Seeded 5 vendors with locations",
  });
}
