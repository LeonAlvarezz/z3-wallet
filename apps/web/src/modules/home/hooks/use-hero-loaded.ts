import { useEffect, useState } from "react";

export function useHeroLoaded(delay = 80) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoaded(true), delay);

    return () => window.clearTimeout(timeoutId);
  }, [delay]);

  return isLoaded;
}
