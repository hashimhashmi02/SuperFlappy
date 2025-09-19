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

  const pipeStyle = "bg-emerald-500/80 border border-emerald-600/50 shadow";

  return (
    <>
   
      <div
        className={`absolute ${pipeStyle}`}
        style={{
          left: x,
          top: 0,
          width: PIPE_W,
          height: topH,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
        }}
      />
    
      <div
        className={`absolute ${pipeStyle}`}
        style={{
          left: x,
          top: bottomY,
          width: PIPE_W,
          height: bottomH,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      />
    </>
  );
};

export default Pipe;
