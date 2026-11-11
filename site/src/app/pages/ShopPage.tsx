import { useState, useMemo, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  ArrowUpDown,
  Search,
  X,
  Grid3X3,
  Grid2X2,
  Sparkles,
} from 'lucide-react';
import { products, CATEGORIES, JERSEY_SIZES, SHIRT_SIZES, type Product } from '../data/products';
import { formatGHS } from '@/lib/money';
import ProductCard from '../components/products/ProductCard';
import ProductDetailModal from '../components/products/ProductDetailModal';

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [onlyNew, setOnlyNew] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Sizes offered across the catalogue
  const availableSizes = [...new Set([...JERSEY_SIZES, ...SHIRT_SIZES])];

  // Filter & Sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Size
    if (selectedSize !== 'All') {
      result = result.filter((p) => p.sizes.includes(selectedSize));
    }

    // Price range
    if (priceRange === 'under-160') {
      result = result.filter((p) => p.price < 160);
    } else if (priceRange === '160-plus') {
      result = result.filter((p) => p.price >= 160);
    }

    // New arrivals only
    if (onlyNew) {
      result = result.filter((p) => p.isNew);
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [searchQuery, selectedCategory, selectedSize, priceRange, onlyNew, sortBy]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    selectedSize !== 'All' ||
    priceRange !== 'all' ||
    onlyNew;

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSize('All');
    setPriceRange('all');
    setOnlyNew(false);
  };

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) return;

      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
        );
      }
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0B0A2A] pt-24 sm:pt-28 pb-32 px-6 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-[1440px]">
        {/* ── Page Header ── */}
        <div ref={headerRef} className="border-b border-white/10 pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-[#F5F0EB]">
                SHOP THE COLLECTION<span className="text-magenta-600">.</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-white/60 font-light max-w-xl">
                Long-sleeve office shirts and quality jerseys. Choose your size, add to bag and pay securely with Paystack.
              </p>
            </div>

            {/* Quick search input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shirts, jerseys..."
                className="w-full bg-[#15134A] border border-white/15 pl-10 pr-9 py-2.5 text-xs uppercase tracking-wider text-white placeholder:text-white/30 focus:border-magenta-600 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Category Filter Bar ── */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
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

        {/* ── Advanced Filter Drawer / Bar ── */}
        <div className="mt-6 border border-white/10 bg-[#15134A] p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {/* Sizes */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-2.5">
                Size
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSize('All')}
                  className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider border ${
                    selectedSize === 'All'
                      ? 'border-magenta-600 bg-magenta-600 text-white'
                      : 'border-white/10 text-white/60 hover:border-white/30'
                  }`}
                >
                  All
                </button>
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider border ${
                      selectedSize === sz
                        ? 'border-magenta-600 bg-magenta-600 text-white'
                        : 'border-white/10 text-white/60 hover:border-white/30'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold block mb-2.5">
                Price
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'All', val: 'all' },
                  { label: `Under ${formatGHS(160)}`, val: 'under-160' },
                  { label: `${formatGHS(160)}+`, val: '160-plus' },
                ].map((p) => (
                  <button
                    key={p.val}
                    onClick={() => setPriceRange(p.val)}
                    className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider border ${
                      priceRange === p.val
                        ? 'border-magenta-600 bg-magenta-600 text-white'
                        : 'border-white/10 text-white/60 hover:border-white/30'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* New toggle + Sort */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
                  New Arrivals Only
                </span>
                <button
                  onClick={() => setOnlyNew(!onlyNew)}
                  className={`h-5 w-9 rounded-full transition-colors relative border ${
                    onlyNew ? 'bg-magenta-600 border-magenta-500' : 'bg-navy-950 border-white/20'
                  }`}
                >
                  <span
                    className={`block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                      onlyNew ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5 text-magenta-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-[#0B0A2A] border border-white/15 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white focus:border-magenta-600 focus:outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-white/40">
                  Active Filters:
                </span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-magenta-600/20 border border-magenta-600/40 text-magenta-400 px-2 py-0.5 text-[10px] uppercase">
                    &quot;{searchQuery}&quot;
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                  </span>
                )}
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-magenta-600/20 border border-magenta-600/40 text-magenta-400 px-2 py-0.5 text-[10px] uppercase">
                    {selectedCategory}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory('All')} />
                  </span>
                )}
                {selectedSize !== 'All' && (
                  <span className="inline-flex items-center gap-1 bg-magenta-600/20 border border-magenta-600/40 text-magenta-400 px-2 py-0.5 text-[10px] uppercase">
                    Size {selectedSize}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSize('All')} />
                  </span>
                )}
                {priceRange !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-magenta-600/20 border border-magenta-600/40 text-magenta-400 px-2 py-0.5 text-[10px] uppercase">
                    Price: {priceRange === 'under-160' ? `Under ${formatGHS(160)}` : `${formatGHS(160)}+`}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setPriceRange('all')} />
                  </span>
                )}
                {onlyNew && (
                  <span className="inline-flex items-center gap-1 bg-magenta-600/20 border border-magenta-600/40 text-magenta-400 px-2 py-0.5 text-[10px] uppercase">
                    New Arrivals Only
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setOnlyNew(false)} />
                  </span>
                )}
              </div>

              <button
                onClick={resetFilters}
                className="text-[10px] uppercase tracking-widest text-magenta-500 hover:text-magenta-400 underline font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* ── Toolbar: Results Count + Grid Toggle ── */}
        <div className="mt-8 flex items-center justify-between border-b border-white/10 pb-4">
          <p className="text-xs uppercase tracking-wider text-white/50">
            Showing <span className="text-white font-bold">{filteredProducts.length}</span> Product{filteredProducts.length === 1 ? '' : 's'}
          </p>

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setGridCols(3)}
              className={`p-1.5 border transition-colors ${
                gridCols === 3 ? 'border-magenta-600 text-magenta-500' : 'border-white/10 text-white/40 hover:text-white'
              }`}
              title="3 Column View"
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setGridCols(4)}
              className={`p-1.5 border transition-colors ${
                gridCols === 4 ? 'border-magenta-600 text-magenta-500' : 'border-white/10 text-white/40 hover:text-white'
              }`}
              title="4 Column View"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Product Grid ── */}
        <div
          className={`mt-8 grid grid-cols-1 sm:grid-cols-2 ${
            gridCols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'
          } gap-6`}
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setActiveModalProduct(p)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-24 text-center border border-white/10 bg-[#100E38] my-8">
            <Sparkles className="h-8 w-8 text-magenta-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold uppercase tracking-wider text-white">
              No matching products found
            </h3>
            <p className="mt-2 text-xs uppercase tracking-wider text-white/40 max-w-sm mx-auto">
              Try adjusting your filters or search.
            </p>
            <button
              onClick={resetFilters}
              className="mt-6 bg-magenta-600 hover:bg-magenta-700 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />
    </div>
  );
}
