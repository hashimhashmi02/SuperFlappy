import { useCallback, useMemo, useRef, useState } from "react";
import { BIRD_X, GROUND_H, PIPE_W, SPAWN_EVERY, VIEW_H, VIEW_W } from "./constants";
import type { Pipe } from "./types";

let PIPE_ID = 1;

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function usePipes() {
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const spawnTimer = useRef(0);

  const spawn = useCallback((gapH: number) => {
    const safeTop = 80;
    const safeBottom = VIEW_H - GROUND_H - 80;
    const gapY = clamp(
      rand(safeTop + gapH / 2, safeBottom - gapH / 2),
      safeTop + gapH / 2,
      safeBottom - gapH / 2
    );
    const p: Pipe = { id: PIPE_ID++, x: VIEW_W + 40, gapY, gapH, passed: false };
    setPipes(prev => [...prev, p]);
  }, []);

  const reset = useCallback(() => {
    PIPE_ID = 1;
    setPipes([]);
    spawnTimer.current = 0;
  }, []);

  
  const update = useCallback(
    (dt: number, speed: number, gapH: number, onPass?: (p: Pipe) => void) => {
      setPipes(prev => {
        const next: Pipe[] = [];
        for (const p of prev) {
          const nx = p.x - speed * dt;

         
          if (!p.passed && nx + PIPE_W < BIRD_X) {
            const marked: Pipe = { ...p, x: nx, passed: true };
            if (onPass) onPass(marked);
            next.push(marked);
          } else {
            next.push({ ...p, x: nx });
          }
        }
        
        return next.filter(p => p.x + PIPE_W > -20);
      });


      spawnTimer.current -= dt;
      const interval = Math.max(0.9, SPAWN_EVERY - speed / 400);
      if (spawnTimer.current <= 0) {
        spawn(gapH);
        spawnTimer.current = interval;
      }
    },
    [spawn]
  );

  return useMemo(() => ({ pipes, update, reset, spawn }), [pipes, update, reset, spawn]);
}
