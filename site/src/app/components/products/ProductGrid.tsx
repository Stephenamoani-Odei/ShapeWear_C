import { useState, useMemo, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import shopBackground from '@/assets/online background.mp4';
import { products, CATEGORIES, type Product } from '../../data/products';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';

gsap.registerPlugin(ScrollTrigger);

export default function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  const containerRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Filter and sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [selectedCategory, sortBy]);

  // GSAP animation on scroll & filter change
  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      if (gridRef.current && gridRef.current.children.length > 0) {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 40, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.07,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    },
    { scope: containerRef, dependencies: [selectedCategory, sortBy] }
  );

  return (
    <section
      ref={containerRef}
      id="shop"
      className="relative isolate overflow-hidden bg-[#0B0A2A] px-6 py-20 sm:px-10 lg:px-16"
    >
      <video
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        src={shopBackground}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-[#0B0A2A]/70" />
      <div className="relative z-10 mx-auto max-w-[1440px]">
        {/* ── Section Header ── */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-magenta-600 rounded-full animate-ping" />
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-magenta-500 font-bold">
                SHAPEWEARFIT // ONLINE STORE
              </p>
            </div>
            <h2 className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F5F0EB]">
              SHOP THE COLLECTION<span className="text-magenta-600">.</span>
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-white/60 font-light max-w-xl">
              Long-sleeve office shirts and quality jerseys. Pick your size, add to bag and pay securely online.
            </p>
          </div>

          {/* Sort dropdown */}
          <div className="mt-6 md:mt-0 flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/40">
              <ArrowUpDown className="h-3.5 w-3.5 text-magenta-500" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#17154E] border border-white/15 px-3 py-2 text-xs font-medium uppercase tracking-wider text-[#F5F0EB] focus:border-magenta-600 focus:outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* ── Category Filter Pills ── */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          <SlidersHorizontal className="h-4 w-4 text-magenta-500 mr-2 shrink-0 hidden sm:block" />
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-magenta-600 text-white shadow-[0_0_20px_rgba(184,21,95,0.4)]'
                    : 'border border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ── Products Grid with Stagger Entrance ── */}
        <div
          ref={gridRef}
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setActiveModalProduct(p)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-xl font-light uppercase tracking-widest text-white/40">
              No products found in this category
            </p>
          </div>
        )}
      </div>

      {/* Quick View / Detail Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />
    </section>
  );
}
