export interface Order {
  id: string;
  date: string;
  status: "Delivered" | "In Transit" | "Pending";
  productName: string;
  originalPrice: number;
  amountPaid: number;
}

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    date: "15 Mar 2026",
    status: "Delivered",
    productName: "20L Premium Water Jug",
    originalPrice: 450,
    amountPaid: 360,
  },
  {
    id: "ORD-002",
    date: "12 Mar 2026",
    status: "Delivered",
    productName: "20L Standard Water Jug",
    originalPrice: 400,
    amountPaid: 400,
  },
  {
    id: "ORD-003",
    date: "8 Mar 2026",
    status: "Delivered",
    productName: "20L Premium Water Jug x3",
    originalPrice: 1350,
    amountPaid: 1080,
  },
  {
    id: "ORD-004",
    date: "1 Mar 2026",
    status: "Delivered",
    productName: "20L Standard Water Jug x2",
    originalPrice: 800,
    amountPaid: 720,
  },
];
