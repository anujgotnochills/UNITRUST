import { Navbar } from '@/components/layout/Navbar';
import { FloatingSidebar } from '@/components/layout/FloatingSidebar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { DecentralisedTrust } from '@/components/sections/DecentralisedTrust';
import { UseCases } from '@/components/sections/UseCases';
import { Roadmap } from '@/components/sections/Roadmap';
import { Community } from '@/components/sections/Community';

export default function Home() {
  return (
    <>
      <Navbar />
      <FloatingSidebar />
      <main>
        <Hero />
        <DecentralisedTrust />
        <UseCases />
        <Roadmap />
        <Community />
      </main>
      <Footer />
    </>
  );
}
