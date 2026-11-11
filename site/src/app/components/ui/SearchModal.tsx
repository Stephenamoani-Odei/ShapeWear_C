import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { products, type Product } from '../../data/products';
import { formatGHS } from '@/lib/money';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export default function SearchModal({ isOpen, onClose, onSelectProduct }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [query]);

  const popularSearches = ['Office shirt', 'Long sleeve', 'Jersey', 'Club', 'Country'];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search ShapeWearFit products"
      className="fixed inset-0 z-[250] flex flex-col bg-[#0B0A2A]/98 backdrop-blur-xl"
    >
      {/* Top search bar */}
      <div className="border-b border-white/10 px-6 py-6 lg:px-16">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="relative flex flex-1 items-center">
            <Search className="absolute left-0 h-6 w-6 text-magenta-500" strokeWidth={2} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH SHIRTS, JERSEYS..."
              className="w-full bg-transparent pl-10 pr-4 text-xl sm:text-2xl font-light uppercase tracking-wider text-[#F5F0EB] placeholder:text-white/20 focus:outline-none"
            />
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 hover:border-magenta-600 hover:text-white transition-colors"
            aria-label="Close search modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main body */}
      <div className="flex-1 overflow-y-auto px-6 py-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          {/* Quick tags */}
          {!query && (
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-4 font-semibold">
                Popular Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="border border-white/10 px-4 py-2 text-xs uppercase tracking-wider text-white/70 hover:border-magenta-600 hover:text-white hover:bg-magenta-600/10 transition-all"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Featured preview */}
              <div className="mt-16">
                <p className="text-xs uppercase tracking-[0.25em] text-magenta-500 mb-6 font-semibold">
                  Featured Products
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {products.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        if (onSelectProduct) onSelectProduct(p);
                        onClose();
                      }}
                      className="group cursor-pointer border border-white/5 bg-[#17154E] p-3 transition-all hover:border-magenta-600/40"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-navy-950 mb-3">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {p.badge && (
                          <span className="absolute top-2 left-2 bg-magenta-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#F5F0EB] truncate group-hover:text-magenta-500 transition-colors">
                        {p.name}
                      </p>
                      <p className="text-xs text-white/50 mt-1">{formatGHS(p.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {query && (
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-6">
                Found {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'} for &ldquo;{query}&rdquo;
              </p>

              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-lg font-light text-white/50 uppercase tracking-widest">
                    No products found matching your search
                  </p>
                  <p className="mt-2 text-xs text-white/30 uppercase tracking-wider">
                    Try searching for &quot;Shirt&quot;, &quot;Jersey&quot;, or &quot;Club&quot;
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="group flex gap-4 border border-white/10 bg-[#15134A] p-4 transition-all hover:border-magenta-600/50"
                    >
                      <div
                        className="relative h-28 w-20 shrink-0 overflow-hidden bg-navy-950 cursor-pointer"
                        onClick={() => {
                          if (onSelectProduct) onSelectProduct(p);
                          onClose();
                        }}
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-magenta-500 font-semibold">
                            {p.category}
                          </span>
                          <h4
                            onClick={() => {
                              if (onSelectProduct) onSelectProduct(p);
                              onClose();
                            }}
                            className="text-sm font-bold uppercase tracking-wider text-[#F5F0EB] hover:text-magenta-500 cursor-pointer transition-colors mt-1"
                          >
                            {p.name}
                          </h4>
                          <p className="text-sm font-semibold text-white/80 mt-1">{formatGHS(p.price)}</p>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => {
                              if (onSelectProduct) onSelectProduct(p);
                              onClose();
                            }}
                            className="flex items-center gap-1.5 bg-magenta-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-magenta-700 transition-colors"
                          >
                            Choose Size
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

