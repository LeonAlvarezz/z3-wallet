import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { homeDisplayFontStyle } from "../utils/home-ui";
import { StaggerSection } from "./StaggerSection";

export function HomeCtaSection() {
  return (
    <StaggerSection>
      <Card className="glow-card relative overflow-hidden rounded-3xl">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="from-primary/8 absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t to-transparent" />
          <div className="bg-primary/10 absolute -bottom-8 -left-8 size-32 rounded-full blur-2xl" />
        </div>

        <CardContent className="relative space-y-4 px-5 pt-6 pb-5">
          <div>
            <p className="text-primary text-sm font-semibold">Start clean</p>
            <h2
              className="mt-2 text-2xl font-bold tracking-tight"
              style={{ ...homeDisplayFontStyle, letterSpacing: "-0.025em" }}
            >
              Create your account and make the first few transactions count.
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              The goal is simple: make your money easier to read every day.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link to="/auth/register" preload={false}>
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </StaggerSection>
  );
}
