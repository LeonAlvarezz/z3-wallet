import { TICKER_ITEMS } from "../constants/home-content";
import { StaggerSection } from "./StaggerSection";

export function BenefitMarquee() {
  return (
    <StaggerSection>
      <div className="border-input/40 bg-secondary/30 overflow-hidden rounded-2xl border mask-x-from-85% py-2.5">
        <div
          className="marquee animate-marquee"
          style={{ "--marquee-duration": "25s" } as React.CSSProperties}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="text-muted-foreground flex items-center gap-3 px-4 text-xs"
            >
              <span className="bg-primary/50 inline-block size-1 shrink-0 rounded-full" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </StaggerSection>
  );
}
