export interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  image: string;
  category: 'hard' | 'soft';
}

export const products: Product[] = [
  { id: 'h1', name: 'Purified Water', size: '20L', price: 500, image: '/20L-Hard.png', category: 'hard' },
  { id: 'h2', name: 'Purified Water', size: '10L', price: 350, image: '/10L-Hard.png', category: 'hard' },
  { id: 's1', name: 'Purified Water', size: '20L', price: 450, image: '/20L-Soft.png', category: 'soft' },
  { id: 's2', name: 'Purified Water', size: '10L', price: 280, image: '/10L-Soft.png', category: 'soft' },
  { id: 's3', name: 'Purified Water', size: '5L', price: 150, image: '/5L-Soft.png', category: 'soft' },
];
