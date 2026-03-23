import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useInView } from "../hooks/use-in-view";
import { AnimatedBalance } from "./AnimatedBalance";
import { AnimatedBars } from "./AnimatedBars";
import { MetricCountCard } from "./MetricCountCard";
import { StaggerSection } from "./StaggerSection";

export function PreviewSection() {
  const { ref: previewRef, inView: previewInView } =
    useInView<HTMLDivElement>(0.2);

  return (
    <section id="preview" className="space-y-6">
      <StaggerSection>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-semibold">Product Preview</p>
            <p className="text-muted-foreground text-xs">
              Familiar surfaces, clearer message
            </p>
          </div>
          <span className="text-muted-foreground border-input/60 rounded-full border px-3 py-1 text-xs">
            This month
          </span>
        </div>
      </StaggerSection>

      <StaggerSection delay={80}>
        <div ref={previewRef}>
          <Card className="glow-card overflow-hidden rounded-3xl">
            <CardContent className="space-y-4 px-5 pt-6 pb-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-xs">
                    Current Balance
                  </p>
                  <p className="mt-2">
                    <AnimatedBalance active={previewInView} />
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-500/12 px-3 py-2 text-right">
                  <p className="text-[11px] text-emerald-400">Monthly trend</p>
                  <p className="text-sm font-medium text-emerald-300">+12%</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <MetricCountCard
                  label="Income"
                  target={2890}
                  prefix="$"
                  active={previewInView}
                  accent="emerald"
                />
                <MetricCountCard
                  label="Spent"
                  target={1606}
                  prefix="$"
                  active={previewInView}
                  accent="rose"
                />
                <MetricCountCard
                  label="Saved"
                  target={428}
                  prefix="$"
                  active={previewInView}
                  accent="primary"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div className="bg-secondary/45 border-input/50 rounded-2xl border p-4">
                  <p className="text-muted-foreground text-xs">
                    Spending rhythm
                  </p>
                  <AnimatedBars active={previewInView} />
                </div>
              </div>

              <div className="flex justify-end">
                <Button asChild variant="ghost" className="rounded-full px-0">
                  <Link to="/auth/register" preload={false}>
                    Explore with your own data
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </StaggerSection>
    </section>
  );
}
