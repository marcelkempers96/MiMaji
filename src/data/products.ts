export interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  image: string;
  category: 'hard' | 'soft';
}

export const products: Product[] = [
  { id: 'h1', name: 'Purified Water', size: '20L', price: 500, image: '/images/purified-20l-hard.png', category: 'hard' },
  { id: 'h2', name: 'Purified Water', size: '10L', price: 300, image: '/images/purified-10l-hard.png', category: 'hard' },
  { id: 'h3', name: 'Purified Water', size: '5L', price: 180, image: '/images/purified-5l-hard.png', category: 'hard' },
  { id: 's1', name: 'Purified Water', size: '20L', price: 450, image: '/images/purified-20l-soft.png', category: 'soft' },
  { id: 's2', name: 'Purified Water', size: '10L', price: 280, image: '/images/purified-10l-soft.png', category: 'soft' },
  { id: 's3', name: 'Purified Water', size: '5L', price: 150, image: '/images/purified-5l-soft.png', category: 'soft' },
];
