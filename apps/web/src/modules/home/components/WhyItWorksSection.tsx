import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FEATURE_CARDS } from "../constants/home-content";
import {
  getFeatureAccentClasses,
  homeDisplayFontStyle,
} from "../utils/home-ui";
import { StaggerSection } from "./StaggerSection";

export function WhyItWorksSection() {
  return (
    <section id="why-it-works" className="space-y-6">
      <StaggerSection>
        <div>
          <p className="text-3xl font-semibold">Why It Works</p>
          <p className="text-muted-foreground text-xs">
            Focused enough for daily use, clear enough for better decisions
          </p>
        </div>
      </StaggerSection>

      <div className="space-y-3">
        {FEATURE_CARDS.map((item, index) => {
          const Icon = item.icon;

          return (
            <StaggerSection key={item.title} delay={index * 80}>
              <Card className="glow-card group rounded-3xl">
                <CardContent className="flex items-start gap-4 px-5 pt-5 pb-5">
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110",
                      getFeatureAccentClasses(item.color),
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h2
                      className="text-base font-semibold"
                      style={homeDisplayFontStyle}
                    >
                      {item.title}
                    </h2>
                    <p className="text-muted-foreground mt-2 text-sm leading-6">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </StaggerSection>
          );
        })}
      </div>
    </section>
  );
}
