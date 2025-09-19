import { useEffect, useRef } from "react";
import { MAX_DT } from "./constants";

export function useGameLoop(
  isRunning: boolean,
  onUpdate: (dt: number) => void
) {
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    function frame(now: number) {
      if (lastRef.current == null) lastRef.current = now;
      const rawDt = (now - lastRef.current) / 1000;
      const dt = Math.min(rawDt, MAX_DT);
      lastRef.current = now;
      onUpdate(dt);
      rafRef.current = requestAnimationFrame(frame);
    }

    if (isRunning) {
      rafRef.current = requestAnimationFrame(frame);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastRef.current = null;
    };
  }, [isRunning, onUpdate]);
}
