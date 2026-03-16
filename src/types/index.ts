export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "success" | "failed";

export type UserRole = "customer" | "distributor" | "admin";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  created_at: string;
}

export interface Zone {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}

export interface Distributor {
  id: string;
  zone_id: string;
  depot_name: string;
  active: boolean;
  zone?: Zone;
  profile?: Profile;
}

export interface Order {
  id: string;
  customer_id: string;
  distributor_id: string | null;
  zone_id: string;
  delivery_address: string;
  lat: number;
  lng: number;
  quantity: number;
  price_total: number;
  status: OrderStatus;
  mpesa_ref: string | null;
  created_at: string;
  updated_at: string;
  distributor?: Distributor;
  zone?: Zone;
  customer?: Profile;
}

export interface Payment {
  id: string;
  order_id: string;
  mpesa_checkout_id: string;
  mpesa_receipt: string | null;
  amount: number;
  status: PaymentStatus;
  raw_callback: Record<string, unknown> | null;
  created_at: string;
}

export interface PricingConfig {
  jug_price_kes: number;
  delivery_fee_kes: number;
}

export interface CreateOrderPayload {
  delivery_address: string;
  lat: number;
  lng: number;
  quantity: number;
  phone: string;
  zone_id?: string;
}
