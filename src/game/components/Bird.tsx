import React from "react";
import { motion } from "framer-motion";
import { BIRD_R } from "../constants";

interface BirdProps {
  y: number;
  vy: number;
  state: "ready" | "running" | "paused" | "gameover";
}

const Bird: React.FC<BirdProps> = ({ y, vy, state }) => {
  const angle = Math.max(-35, Math.min(60, (vy / 520) * 60)); // deg

  return (
    <motion.div
      className="absolute"
      style={{ left: 0, top: 0, transform: `translate3d(0,0,0)` }}
    >
      <motion.div
        aria-label="bird"
        className="absolute will-change-transform"
        animate={{ x: 0, y }}
        transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.6 }}
      >
        <motion.div
          className="relative rounded-full shadow-md"
          style={{
            width: BIRD_R * 2,
            height: BIRD_R * 2,
            background:
              "radial-gradient(60% 60% at 30% 30%, #fde68a 0%, #f59e0b 70%)",
            border: "2px solid rgba(0,0,0,.12)",
          }}
          animate={{ rotate: angle }}
          transition={{ type: "tween", duration: 0.08 }}
        >
       
          <div className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-white" />
          <div className="absolute right-1.5 top-2.5 h-1.5 w-1.5 rounded-full bg-black/80" />

          
          <motion.div
            className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-7 rounded-full bg-black/10"
            animate={state === "running" ? { y: ["-2px", "2px", "-2px"] } : {}}
            transition={{ repeat: Infinity, duration: 0.25 }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Bird;
