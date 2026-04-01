const TOAST_EDGE_GAP = 16;

export type ViewportBounds = {
  width: number;
  height: number;
  offsetTop: number;
  offsetLeft: number;
};

type ViewportSize = {
  width: number;
  height: number;
};

export function getViewportToastOffset(
  viewport: ViewportBounds | null | undefined = null,
  layoutViewport: ViewportSize = { width: 0, height: 0 },
  gap = TOAST_EDGE_GAP,
) {
  if (!viewport) {
    return {
      top: gap,
      right: gap,
      bottom: gap,
      left: gap,
    };
  }

  const topInset = Math.max(0, viewport.offsetTop);
  const leftInset = Math.max(0, viewport.offsetLeft);
  const rightInset = Math.max(
    0,
    layoutViewport.width - viewport.width - viewport.offsetLeft,
  );
  const bottomInset = Math.max(
    0,
    layoutViewport.height - viewport.height - viewport.offsetTop,
  );

  return {
    top: topInset + gap,
    right: rightInset + gap,
    bottom: bottomInset + gap,
    left: leftInset + gap,
  };
}
