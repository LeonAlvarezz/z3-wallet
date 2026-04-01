import { Card, CardContent } from "@/components/ui/card";
import {
  createAnimationDelayStyle,
  homeDisplayFontStyle,
} from "../utils/home-ui";
import { HeroSmartInputPreview } from "./HeroSmartInputPreview";

export function HeroSection() {
  return (
    <section id="hero">
      <Card
        className="glow-card relative overflow-hidden rounded-[2rem] border py-0 shadow-[0_28px_80px_-44px_hsl(var(--primary)/0.35)]"
        style={createAnimationDelayStyle(120)}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="from-primary/10 absolute inset-x-0 top-0 h-40 bg-linear-to-b to-transparent" />
          <div className="bg-primary/10 absolute -top-14 right-0 h-44 w-44 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 h-28 w-56 bg-amber-400/8 blur-3xl" />
          <div className="absolute inset-y-0 right-0 w-1/2 bg-linear-to-l from-sky-500/6 via-transparent to-transparent" />
        </div>

        <div
          className="relative mx-auto flex max-w-xl flex-col items-center gap-4 px-6 pt-8 text-center sm:px-10 sm:pt-10"
          style={createAnimationDelayStyle(180)}
        >
          <div className="space-y-3">
            <h1
              className="hero-headline text-center text-4xl sm:text-3xl"
              style={homeDisplayFontStyle}
            >
              Log transactions the way you already type
            </h1>
            <p className="text-muted-foreground text-sm">
              Match amount, category, and payee instantly, so adding expenses
              feels fast, natural, and effortless.
            </p>
          </div>
        </div>
        <CardContent className="px-4 pt-4 pb-4 sm:px-5 sm:pt-5 sm:pb-5">
          <div
            className="animate-slide-up w-full"
            style={createAnimationDelayStyle(280)}
          >
            <HeroSmartInputPreview />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
