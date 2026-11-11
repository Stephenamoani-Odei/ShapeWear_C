import Hero from '../components/hero/Hero';
import BrandStatement from '../components/sections/BrandStatement';
import PinnedCollection from '../components/sections/PinnedCollection';
import ProductGrid from '../components/products/ProductGrid';
import Campaign from '../components/sections/Campaign';
import BrandStory from '../components/sections/BrandStory';

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandStatement />
      <PinnedCollection />
      <ProductGrid />
      <Campaign />
      <BrandStory />
    </>
  );
}
