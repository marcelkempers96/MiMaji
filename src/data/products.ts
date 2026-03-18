export interface Product {
  id: string;
  name: string;
  size: string;
  price: number;
  image: string;
  category: 'hard' | 'soft';
}

export const products: Product[] = [
  { id: 'h1', name: 'Keringet', size: '20L', price: 500, image: '/images/keringet-20l.png', category: 'hard' },
  { id: 'h2', name: 'Aquafina', size: '20L', price: 450, image: '/images/aquafina-20l.png', category: 'hard' },
  { id: 'h3', name: 'Highland', size: '20L', price: 480, image: '/images/highland-20l.png', category: 'hard' },
  { id: 's1', name: 'Keringet', size: '1L (Pack of 12)', price: 600, image: '/images/keringet-1l.png', category: 'soft' },
  { id: 's2', name: 'Aquafina', size: '500ml (Pack of 24)', price: 900, image: '/images/aquafina-500ml.png', category: 'soft' },
  { id: 's3', name: 'Dasani', size: '1.5L (Pack of 6)', price: 450, image: '/images/dasani-1.5l.png', category: 'soft' },
];
