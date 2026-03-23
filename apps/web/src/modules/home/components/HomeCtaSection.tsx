import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { homeDisplayFontStyle } from "../utils/home-ui";
import { StaggerSection } from "./StaggerSection";

export function HomeCtaSection() {
  return (
    <StaggerSection>
      <Card
        id="get-started"
        className="glow-card relative overflow-hidden rounded-3xl"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="from-primary/8 absolute inset-x-0 bottom-0 h-32 bg-linear-to-t to-transparent" />
          <div className="bg-primary/10 absolute -bottom-8 -left-8 size-32 rounded-full blur-2xl" />
        </div>

        <CardContent className="relative space-y-4 px-5 pt-6 pb-5">
          <div>
            <p className="text-primary text-sm font-semibold">
              Ready when you are
            </p>
            <h2
              className="mt-2 text-2xl font-bold tracking-tight"
              style={{ ...homeDisplayFontStyle, letterSpacing: "-0.025em" }}
            >
              Start with a few quick entries and make your money easier to read.
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Create your account, log your first transactions, and build a
              clearer daily picture without adding more friction to the habit.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link to="/auth/register" preload={false}>
                Start tracking
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </StaggerSection>
  );
}
