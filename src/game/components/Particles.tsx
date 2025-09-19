import React from "react";
import type { Particle } from "../useParticles";

const Particles: React.FC<{ items: Particle[] }> = ({ items }) => {
  return (
    <>
      {items.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.x - p.r,
            top: p.y - p.r,
            width: p.r * 2,
            height: p.r * 2,
            opacity: p.a,
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95), rgba(251,191,36,0.8))",
            filter: "blur(0.2px)",
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
};

export default Particles;
