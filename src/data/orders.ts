export interface Order {
  id: string;
  date: string;
  status: "Delivered" | "In Transit" | "Processing" | "Confirmed";
  productName: string;
  originalPrice: number;
  amountPaid: number;
  quantity?: number;
}

export const mockOrders: Order[] = [
  {
    id: "ORD-005",
    date: "19 Mar 2026",
    status: "In Transit",
    productName: "20L Premium Water Jug",
    originalPrice: 450,
    amountPaid: 360,
    quantity: 2,
  },
  {
    id: "ORD-006",
    date: "19 Mar 2026",
    status: "Processing",
    productName: "20L Standard Water Jug",
    originalPrice: 500,
    amountPaid: 500,
    quantity: 1,
  },
  {
    id: "ORD-001",
    date: "15 Mar 2026",
    status: "Delivered",
    productName: "20L Premium Water Jug",
    originalPrice: 450,
    amountPaid: 360,
    quantity: 1,
  },
  {
    id: "ORD-002",
    date: "12 Mar 2026",
    status: "Delivered",
    productName: "20L Standard Water Jug",
    originalPrice: 400,
    amountPaid: 400,
    quantity: 1,
  },
  {
    id: "ORD-003",
    date: "8 Mar 2026",
    status: "Delivered",
    productName: "20L Premium Water Jug x3",
    originalPrice: 1350,
    amountPaid: 1080,
    quantity: 3,
  },
  {
    id: "ORD-004",
    date: "1 Mar 2026",
    status: "Delivered",
    productName: "20L Standard Water Jug x2",
    originalPrice: 800,
    amountPaid: 720,
    quantity: 2,
  },
];
