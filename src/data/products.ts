import { StaticImageData } from "next/image";
import { hard20L, hard10L, soft20L, soft10L, soft5L } from "@/assets/images";

export interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  image: StaticImageData;
  category: 'hard' | 'soft';
}

export const products: Product[] = [
  { id: 'h1', name: 'Purified Water', size: '20L', price: 500, image: hard20L, category: 'hard' },
  { id: 'h2', name: 'Purified Water', size: '10L', price: 350, image: hard10L, category: 'hard' },
  { id: 's1', name: 'Purified Water', size: '20L', price: 450, image: soft20L, category: 'soft' },
  { id: 's2', name: 'Purified Water', size: '10L', price: 280, image: soft10L, category: 'soft' },
  { id: 's3', name: 'Purified Water', size: '5L', price: 150, image: soft5L, category: 'soft' },
];
