import React from "react";
import { VIEW_H, VIEW_W, GROUND_H } from "../constants";


const Parallax: React.FC<{ worldX: number }> = ({ worldX }) => {
  const layer1 = -worldX * 0.3;
  const layer2 = -worldX * 0.6;

  const cloud = "bg-white/70 blur-xl rounded-full absolute";
  return (
    <>
    
      <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateX(${layer1}px)` }}>
        <div className={`${cloud}`} style={{ top: 40, left: 10, width: 100, height: 40 }} />
        <div className={`${cloud}`} style={{ top: 120, left: 280, width: 120, height: 48 }} />
        <div className={`${cloud}`} style={{ top: 220, left: 160, width: 90, height: 36 }} />
      </div>

     
      <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateX(${layer2}px)` }}>
        <div className={`${cloud}`} style={{ top: 80, left: 200, width: 140, height: 56 }} />
        <div className={`${cloud}`} style={{ top: 180, left: 40, width: 110, height: 44 }} />
      </div>


      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: GROUND_H - 6,
          height: 20,
          background: "linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0))",
        }}
      />
    </>
  );
};

export default Parallax;
