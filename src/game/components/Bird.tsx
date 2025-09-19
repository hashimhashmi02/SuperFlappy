import React from "react";
import { BIRD_R } from "../constants";

interface BirdProps {
  y: number;
  vy: number;
  state: "ready" | "running" | "paused" | "gameover";
}

const Bird: React.FC<BirdProps> = ({ y, vy }) => {

  const angle = Math.max(-35, Math.min(60, (vy / 520) * 60)); // deg

  return (
    <div
      className="absolute will-change-transform"
      style={{ transform: `translateY(${y}px)` }}
      aria-label="bird"
    >
      <div
        className="relative rounded-full shadow-md"
        style={{
          width: BIRD_R * 2,
          height: BIRD_R * 2,
          transform: `rotate(${angle}deg)`,
          background:
            "radial-gradient(60% 60% at 30% 30%, #fde68a 0%, #f59e0b 70%)",
          border: "2px solid rgba(0,0,0,.12)",
        }}
      >
   
        <div className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-white" />
        <div className="absolute right-1.5 top-2.5 h-1.5 w-1.5 rounded-full bg-black/80" />

       
        <div className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-7 rounded-full bg-black/10" />
      </div>
    </div>
  );
};

export default Bird;
