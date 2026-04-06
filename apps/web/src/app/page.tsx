import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Navbar } from '@/components/layout/Navbar';
import { FloatingSidebar } from '@/components/layout/FloatingSidebar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { ScrambledText } from '@/components/sections/ScrambledText';
import { ProblemSolution } from '@/components/sections/ProblemSolution';
import { FeaturesBento } from '@/components/sections/FeaturesBento';
import { UseCases } from '@/components/sections/UseCases';
import { Roadmap } from '@/components/sections/Roadmap';
import { FrameAnimation } from '@/components/sections/FrameAnimation';
import { Community } from '@/components/sections/Community';
import { MarqueeTicker } from '@/components/sections/MarqueeTicker';

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <FloatingSidebar />
      <main>
        <Hero />
        <ScrambledText />
        <ProblemSolution />
        <FeaturesBento />
        <UseCases />
        <Roadmap />
        <FrameAnimation />
        <Community />
        <MarqueeTicker />
      </main>
      <Footer />
    </>
  );
}
