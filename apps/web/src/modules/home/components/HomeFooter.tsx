import { CircleDollarSign } from "lucide-react";
import { homeDisplayFontStyle } from "../utils/home-ui";
import { StaggerSection } from "./StaggerSection";

export function HomeFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <StaggerSection>
      <footer className="border-input/50 bg-card/45 relative overflow-hidden rounded-3xl border px-5 py-5 backdrop-blur-sm">
        <div className="bg-primary/8 pointer-events-none absolute -right-8 -bottom-8 size-28 rounded-full blur-2xl" />

        <div className="relative flex flex-col gap-5">
          <div className="flex gap-4">
            <div className="text-primary bg-primary/10 flex size-10 items-center justify-center rounded-2xl">
              <CircleDollarSign className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={homeDisplayFontStyle}>
                My Wallet
              </p>
              <p className="text-muted-foreground text-xs">
                Personal finance, made calmer
              </p>
            </div>
          </div>
        </div>
        <div className="border-input/50 text-muted-foreground relative mt-5 flex flex-col gap-2 border-t pt-4 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} My Wallet. All rights reserved.</p>
        </div>
      </footer>
    </StaggerSection>
  );
}
