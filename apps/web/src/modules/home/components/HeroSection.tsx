import { Card, CardContent } from "@/components/ui/card";
import { createAnimationDelayStyle } from "../utils/home-ui";
import { HeroSmartInputPreview } from "./HeroSmartInputPreview";

export function HeroSection() {
  return (
    <section>
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

        <CardContent className="p-4 sm:p-5">
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
