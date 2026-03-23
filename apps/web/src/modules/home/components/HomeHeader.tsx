import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  createAnimationDelayStyle,
  homeDisplayFontStyle,
} from "../utils/home-ui";

export function HomeHeader() {
  return (
    <header
      className="animate-fade-in flex items-center justify-between"
      style={createAnimationDelayStyle(0)}
    >
      <div className="flex items-center gap-3">
        <div className="text-primary flex size-12 items-center justify-center rounded-full px-2">
          <img src="/wallet-logo.svg"></img>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold" style={homeDisplayFontStyle}>
            Z3 Wallet
          </span>
          <span className="text-muted-foreground text-xs">
            Personal finance, made calmer
          </span>
        </div>
      </div>

      <Button asChild variant="ghost" className="rounded-full">
        <Link to="/auth/login" preload={false}>
          Sign in
        </Link>
      </Button>
    </header>
  );
}
