import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Home,
  RefreshCcw,
  SearchX,
  ShieldAlert,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { parseRouteError } from "../lib/route-error";

type StatusPageFrameProps = {
  actions?: ReactNode;
  code: string;
  description: string;
  icon: LucideIcon;
  label: string;
  title: string;
};

function StatusPageFrame({
  actions,
  code,
  description,
  icon: Icon,
  label,
  title,
}: StatusPageFrameProps) {
  return (
    <main className="bg-background relative flex min-h-lvh items-center justify-center overflow-hidden px-4 py-8">
      <div className="bg-primary/10 absolute inset-x-8 top-8 h-32 rounded-full blur-3xl" />
      <div className="absolute right-0 bottom-0 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute bottom-10 left-0 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl" />

      <Card className="border-input/60 bg-card/95 relative w-full max-w-lg overflow-hidden rounded-[2rem] py-0 shadow-[0_28px_70px_-42px_hsl(var(--foreground)/0.35)] backdrop-blur-sm">
        <div className="from-primary/10 absolute inset-x-0 top-0 h-32 bg-linear-to-b to-transparent" />

        <CardContent className="relative flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-8 sm:py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-[1.5rem] border border-current/10">
              <Icon className="size-8" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase">
              {label}
            </p>
            <p className="text-primary/85 text-5xl leading-none font-semibold tracking-[-0.04em]">
              {code}
            </p>
            <h1 className="text-foreground text-2xl leading-tight font-semibold sm:text-3xl">
              {title}
            </h1>
            <p className="text-muted-foreground text-sm leading-6 sm:text-base">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {actions}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function CommonActions({
  primary,
  secondaryLabel = "Go back",
}: {
  primary: ReactNode;
  secondaryLabel?: string;
}) {
  return (
    <>
      {primary}
      <Button
        type="button"
        variant="outline"
        className="rounded-full"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="size-4" />
        {secondaryLabel}
      </Button>
    </>
  );
}

export function NotFoundPage() {
  return (
    <StatusPageFrame
      code="404"
      label="Not Found"
      title="That page is missing"
      description="The page you were looking for does not exist or may have been moved somewhere else."
      icon={SearchX}
      actions={
        <CommonActions
          primary={
            <Button asChild className="rounded-full">
              <Link to="/">
                <Home className="size-4" />
                Back to home
              </Link>
            </Button>
          }
        />
      }
    />
  );
}

export function ForbiddenPage() {
  return (
    <StatusPageFrame
      code="403"
      label="Forbidden"
      title="You do not have access to this page"
      description="This area is available, but your account or current session does not have permission to view it."
      icon={ShieldAlert}
      actions={
        <CommonActions
          primary={
            <Button asChild className="rounded-full">
              <Link to="/">
                <Home className="size-4" />
                Back to home
              </Link>
            </Button>
          }
        />
      }
    />
  );
}

export function GenericErrorPage({
  reset,
}: {
  details?: string;
  reset?: () => void;
}) {
  const router = useRouter();

  return (
    <StatusPageFrame
      code="500"
      label="Error"
      title="Something went wrong"
      description="We hit an unexpected problem while loading this page. You can try again or head back to a safer place."
      icon={TriangleAlert}
      actions={
        <>
          <Button
            type="button"
            className="rounded-full"
            onClick={() => {
              reset?.();
              void router.invalidate();
            }}
          >
            <RefreshCcw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">
              <Home className="size-4" />
              Back to home
            </Link>
          </Button>
        </>
      }
    />
  );
}

export function RouteErrorPage({
  error,
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  const { variant } = parseRouteError(error);

  if (variant === "not-found") {
    return <NotFoundPage />;
  }

  if (variant === "forbidden") {
    return <ForbiddenPage />;
  }

  return <GenericErrorPage reset={reset} />;
}
