import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo/Logo";
import { Link } from "@tanstack/react-router";
import { homeDisplayFontStyle } from "../utils/home-ui";
import { StaggerSection } from "./StaggerSection";

const footerSections = [
  { href: "#hero", label: "Overview" },
  { href: "#preview", label: "Preview" },
  { href: "#why-it-works", label: "Why it works" },
  { href: "#get-started", label: "Get started" },
];

export function HomeFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <StaggerSection>
      <footer className="border-input/50 bg-card/45 relative overflow-hidden rounded-3xl border px-5 py-5 backdrop-blur-sm">
        <div className="bg-primary/8 pointer-events-none absolute -right-8 -bottom-8 size-28 rounded-full blur-2xl" />
        <div className="bg-primary/6 pointer-events-none absolute top-6 -left-10 h-24 w-24 rounded-full blur-2xl" />

        <div className="relative flex flex-col gap-6 sm:gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Logo className="text-primary size-12 rounded-full px-2" />
                <div className="flex flex-col">
                  <span
                    className="text-sm font-semibold"
                    style={homeDisplayFontStyle}
                  >
                    Z3 Wallet
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Type less. Understand more.
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground max-w-sm text-sm">
                A focused personal finance app for logging spending quickly,
                reading cash flow clearly, and staying close to your money
                without the usual clutter.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild className="rounded-full">
                <Link to="/auth/register" preload={false}>
                  Create account
                </Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-full">
                <Link to="/auth/login" preload={false}>
                  Sign in
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-5 sm:justify-self-end">
            <div>
              <p className="text-foreground text-sm font-medium">Explore</p>
              <nav className="mt-3 flex flex-col gap-2 text-sm">
                {footerSections.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>

        <div className="border-input/50 text-muted-foreground relative mt-5 flex flex-col gap-2 border-t pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Z3 Wallet. All rights reserved.</p>
        </div>
      </footer>
    </StaggerSection>
  );
}
