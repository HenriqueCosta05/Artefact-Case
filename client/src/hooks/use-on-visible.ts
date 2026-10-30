import { useEffect, useRef } from "react";

// Calls onVisible whenever the returned element scrolls into (or near) the viewport.
// The 200px margin starts loading the next page before the user hits the bottom.
export const useOnVisible = <T extends Element>(onVisible: () => void, enabled: boolean) => {
  const ref = useRef<T>(null);
  const callback = useRef(onVisible);

  useEffect(() => {
    callback.current = onVisible;
  });

  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    const observer = new IntersectionObserver(
      (entries) => entries.some((entry) => entry.isIntersecting) && callback.current(),
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
};
