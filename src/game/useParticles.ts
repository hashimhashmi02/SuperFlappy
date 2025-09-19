import { useCallback, useMemo, useRef, useState } from "react";

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;     
  life: number;  
}

let PID = 1;

export function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const poolRef = useRef<Particle[]>([]);
  const emitCount = 10;

  const emitBurst = useCallback((x: number, y: number) => {
    const out: Particle[] = [];
    for (let i = 0; i < emitCount; i++) {
      const ang = (-Math.PI / 2) + (Math.random() - 0.5) * 0.9; // upward spread
      const spd = 70 + Math.random() * 90;
      out.push({
        id: PID++,
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: 2 + Math.random() * 3.5,
        a: 0.9,
        life: 0.4 + Math.random() * 0.25,
      });
    }
    setParticles(p => [...p, ...out]);
  }, []);

  const update = useCallback((dt: number) => {
    setParticles(prev => {
      const next: Particle[] = [];
      for (const p of prev) {
        const life = p.life - dt;
        if (life <= 0) continue;
        const nx = p.x + p.vx * dt;
        const ny = p.y + p.vy * dt;
        const nvx = p.vx * 0.98;
        const nvy = p.vy + 400 * dt; 
        const a = Math.max(0, p.a - dt * 2.2);
        next.push({ ...p, x: nx, y: ny, vx: nvx, vy: nvy, a, life });
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    PID = 1;
    setParticles([]);
  }, []);

  return useMemo(() => ({ particles, emitBurst, update, reset }), [particles, emitBurst, update, reset]);
}
