// ShapeWearFit — Product Data & Types
// Online clothing store · Accra, Ghana · prices are in Ghana cedis (GH₵).
//
// NOTE: prices below are placeholders — set your real prices here.
// This file is the single source of truth: the checkout server reads
// prices from it, so the customer can never change what they pay.
import jerseyStripes from '@/assets/jersey-stripes.jpg';
import jerseySky from '@/assets/jersey-skyblue.jpg';
import jerseyCountry from '@/assets/jersey-country.jpg';
import jerseyNavy from '@/assets/jersey-navy.jpg';
import shirtPink from '@/assets/polo-pink.jpg';
import shirtBeige from '@/assets/polo-beige.jpg';

export interface Product {
  id: string;
  name: string;
  /** Price in Ghana cedis (GH₵) */
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  details?: string[];
  /** Customers choose a size only — there is no colour selection. */
  sizes: string[];
  /** Long-sleeve shirts only: the customer must also choose one of these fits. */
  fits?: string[];
  images: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  badge?: string;
}

export const CATEGORIES = ['All', 'Office Shirts', 'Club Jerseys', 'Country Jerseys'] as const;
export type Category = (typeof CATEGORIES)[number];

export const JERSEY_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
export const SHIRT_SIZES = ['M', 'L', 'XL', 'XXL', '3XL', '4XL'];
export const SHIRT_FITS = ['Custom Fit', 'Slim Fit'];

const JERSEY_DETAILS = [
  'Lightweight, breathable quick-dry fabric',
  'Regular athletic fit',
  'Ribbed collar and cuffs',
  'Sizes S to XXL',
];

export const products: Product[] = [
  {
    id: 'shirt-oxford-pink',
    name: 'Oxford Long-Sleeve Shirt — Salmon Pink',
    price: 180,
    category: 'Office Shirts',
    description:
      'A crisp long-sleeve oxford shirt with a button-down collar. Smart enough for meetings and client days, comfortable enough to wear all day at the office.',
    details: ['100% cotton oxford', 'Button-down collar', 'Long sleeves with button cuffs', 'Available in Custom Fit or Slim Fit'],
    sizes: SHIRT_SIZES,
    fits: SHIRT_FITS,
    images: [shirtPink],
    isBestseller: true,
    badge: 'BESTSELLER',
  },
  {
    id: 'shirt-classic-beige',
    name: 'Classic Long-Sleeve Shirt — Beige',
    price: 180,
    category: 'Office Shirts',
    description:
      'A clean beige long-sleeve shirt with a chest pocket. A neutral office essential that pairs easily with trousers, a tie or a blazer.',
    details: ['Soft cotton blend', 'Chest pocket', 'Long sleeves with button cuffs', 'Available in Custom Fit or Slim Fit'],
    sizes: SHIRT_SIZES,
    fits: SHIRT_FITS,
    images: [shirtBeige],
  },
  {
    id: 'club-stripes-home',
    name: 'Club Home Jersey — Red & Blue',
    price: 150,
    category: 'Club Jerseys',
    description:
      'Classic red and blue striped club home jersey. Lightweight and breathable for matchday, weekends and everyday wear.',
    details: JERSEY_DETAILS,
    sizes: JERSEY_SIZES,
    images: [jerseyStripes],
    isBestseller: true,
    badge: 'BESTSELLER',
  },
  {
    id: 'club-sky-blue',
    name: 'Club Jersey — Sky Blue',
    price: 150,
    category: 'Club Jerseys',
    description:
      'Sky blue club jersey with a clean white V-collar. Soft, light and comfortable from the stadium to the street.',
    details: JERSEY_DETAILS,
    sizes: JERSEY_SIZES,
    images: [jerseySky],
    isNew: true,
    badge: 'NEW',
  },
  {
    id: 'club-navy-away',
    name: 'Club Away Jersey — Navy',
    price: 160,
    category: 'Club Jerseys',
    description:
      'Deep navy away jersey with bold orange collar trim. A sharp look for the stands and for casual days.',
    details: JERSEY_DETAILS,
    sizes: JERSEY_SIZES,
    images: [jerseyNavy],
    isNew: true,
    badge: 'NEW',
  },
  {
    id: 'country-white-green',
    name: 'Country Jersey — White & Green',
    price: 160,
    category: 'Country Jerseys',
    description:
      'National-team style white jersey with green and yellow trim. Back your country on matchday in a comfortable, breathable fit.',
    details: JERSEY_DETAILS,
    sizes: JERSEY_SIZES,
    images: [jerseyCountry],
    isBestseller: true,
    badge: 'BESTSELLER',
  },
];

// ── Utility helpers ────────────────────────────────────────

/** Find a single product by its id */
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/** Filter products by category (pass "All" or empty string for everything) */
export function getProductsByCategory(category: string): Product[] {
  if (!category || category === 'All') return products;
  return products.filter((p) => p.category === category);
}

/** Search products by name, description or category */
export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}
