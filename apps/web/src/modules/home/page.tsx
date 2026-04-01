"use client";

import "./home.css";
import { HomeBackground } from "./components/HomeBackground";
import { HomeCtaSection } from "./components/HomeCtaSection";
import { HomeFooter } from "./components/HomeFooter";
import { HomeHeader } from "./components/HomeHeader";
import { HeroSection } from "./components/HeroSection";
import { PreviewSection } from "./components/PreviewSection";
import { BenefitMarquee } from "./components/BenefitMarquee";
import { WhyItWorksSection } from "./components/WhyItWorksSection";

export default function HomePage() {
  return (
    <main className="bg-background text-foreground relative min-h-lvh overflow-hidden">
      <HomeBackground />

      <div className="relative flex min-h-lvh flex-col gap-10 overflow-y-auto p-4 pb-16">
        <HomeHeader />
        <HeroSection />
        <BenefitMarquee />
        <PreviewSection />
        <WhyItWorksSection />
        <HomeCtaSection />
        <HomeFooter />
      </div>
    </main>
  );
}
