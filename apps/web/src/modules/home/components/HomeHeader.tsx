import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo/Logo";
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
        <Logo className="text-primary size-12 rounded-full px-2" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold" style={homeDisplayFontStyle}>
            Z3 Wallet
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
