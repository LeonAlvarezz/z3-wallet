import { useEffect, useRef, useState } from "react";

export function useInView<TElement extends HTMLElement = HTMLDivElement>(
  threshold = 0.15,
) {
  const ref = useRef<TElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setInView(true);
        observer.disconnect();
      },
      { threshold },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
