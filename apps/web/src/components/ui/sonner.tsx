import * as React from "react";
import { useTheme } from "@/modules/theme/use-theme";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { getViewportToastOffset } from "./sonner.utils";

const Toaster = ({
  offset,
  mobileOffset,
  position = "top-center",
  ...props
}: ToasterProps) => {
  const { theme = "dark" } = useTheme();
  const [viewportOffset, setViewportOffset] = React.useState(() =>
    getViewportToastOffset(),
  );

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncViewportOffset = () => {
      const viewport = window.visualViewport;

      setViewportOffset(
        getViewportToastOffset(
          viewport
            ? {
                width: viewport.width,
                height: viewport.height,
                offsetTop: viewport.offsetTop,
                offsetLeft: viewport.offsetLeft,
              }
            : null,
          {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        ),
      );
    };

    syncViewportOffset();

    const viewport = window.visualViewport;

    window.addEventListener("resize", syncViewportOffset);
    viewport?.addEventListener("resize", syncViewportOffset);
    viewport?.addEventListener("scroll", syncViewportOffset);

    return () => {
      window.removeEventListener("resize", syncViewportOffset);
      viewport?.removeEventListener("resize", syncViewportOffset);
      viewport?.removeEventListener("scroll", syncViewportOffset);
    };
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position}
      offset={offset ?? viewportOffset}
      mobileOffset={mobileOffset ?? viewportOffset}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
