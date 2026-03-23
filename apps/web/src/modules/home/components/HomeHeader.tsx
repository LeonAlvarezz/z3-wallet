import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { CircleDollarSign } from "lucide-react";
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
        <div className="pulse-icon bg-card border-input/50 text-primary flex size-11 items-center justify-center rounded-2xl border">
          <CircleDollarSign className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold" style={homeDisplayFontStyle}>
            My Wallet
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
