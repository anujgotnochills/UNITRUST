import { Navbar } from '@/components/layout/Navbar';
import { FloatingSidebar } from '@/components/layout/FloatingSidebar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { ProblemSolution } from '@/components/sections/ProblemSolution';
import { FeaturesBento } from '@/components/sections/FeaturesBento';
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
        <ProblemSolution />
        <FeaturesBento />
        <UseCases />
        <Roadmap />
        <Community />
      </main>
      <Footer />
    </>
  );
}
