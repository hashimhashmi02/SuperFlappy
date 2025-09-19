import React from "react";
import { GROUND_H, PIPE_W, VIEW_H } from "../constants";

interface PipeProps {
  x: number;
  gapY: number;
  gapH: number;
}

const Pipe: React.FC<PipeProps> = ({ x, gapY, gapH }) => {
  const topH = Math.max(0, gapY - gapH / 2);
  const bottomY = gapY + gapH / 2;
  const bottomH = (VIEW_H - GROUND_H) - bottomY;

  const body = "bg-emerald-500/85 border border-emerald-700/40 shadow";
  const cap = "bg-emerald-600/90 border border-emerald-800/40";

  return (
    <>
      {/* Top pipe body */}
      <div
        className={`absolute ${body}`}
        style={{
          left: x,
          top: 0,
          width: PIPE_W,
          height: topH,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        }}
      />
      {/* Top cap */}
      <div
        className={`absolute ${cap}`}
        style={{
          left: x - 6,
          top: Math.max(0, topH - 14),
          width: PIPE_W + 12,
          height: 14,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          boxShadow: "inset 0 -2px 0 rgba(255,255,255,.2)",
        }}
      />

      {/* Bottom pipe body */}
      <div
        className={`absolute ${body}`}
        style={{
          left: x,
          top: bottomY,
          width: PIPE_W,
          height: bottomH,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      />
      {/* Bottom cap */}
      <div
        className={`absolute ${cap}`}
        style={{
          left: x - 6,
          top: bottomY,
          width: PIPE_W + 12,
          height: 14,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          boxShadow: "inset 0 2px 0 rgba(255,255,255,.2)",
        }}
      />
    </>
  );
};

export default Pipe;
