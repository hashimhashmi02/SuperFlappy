import { BIRD_R, BIRD_X, GROUND_H, PIPE_W, VIEW_H, VIEW_W } from "../constants";
import type { Pipe } from "./types";

export interface Atlases {
  pipeBody: HTMLCanvasElement;
  pipeCap: HTMLCanvasElement;
  ground: HTMLCanvasElement;
  bg: HTMLCanvasElement;
}

export function makeAtlases(dpr: number): Atlases {
  const make = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.floor(w * dpr));
    c.height = Math.max(1, Math.floor(h * dpr));
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    draw(ctx);
    return c;
  };

  const pipeBody = make(PIPE_W, 200, (ctx) => {
    const w = PIPE_W, h = 200;
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#22c55e");
    grd.addColorStop(1, "#16a34a");
    ctx.fillStyle = grd;
    ctx.strokeStyle = "rgba(0,0,0,.18)";
    ctx.lineWidth = 1;
    roundRect(ctx, 0, 0, w, h, 10);
    ctx.fill(); ctx.stroke();
  });

  const pipeCap = make(PIPE_W + 12, 14, (ctx) => {
    const w = PIPE_W + 12, h = 14;
    ctx.fillStyle = "#059669";
    ctx.strokeStyle = "rgba(0,0,0,.22)";
    ctx.lineWidth = 1;
    roundRect(ctx, 0, 0, w, h, 8);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.25)";
    ctx.fillRect(2, 2, w - 4, 2);
  });

  const ground = make(VIEW_W, GROUND_H, (ctx) => {
    const grd = ctx.createLinearGradient(0, 0, 0, GROUND_H);
    grd.addColorStop(0, "#fde047");
    grd.addColorStop(1, "#f59e0b");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, VIEW_W, GROUND_H);
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#000";
    for (let x = -40; x < VIEW_W + 40; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 40, GROUND_H);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });

  const bg = make(VIEW_W, VIEW_H, (ctx) => {
    const grd = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    grd.addColorStop(0, "#dbeafe");
    grd.addColorStop(1, "#fef3c7");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  });

  return { pipeBody, pipeCap, ground, bg };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const r2 = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r2, y);
  ctx.arcTo(x + w, y, x + w, y + h, r2);
  ctx.arcTo(x + w, y + h, x, y + h, r2);
  ctx.arcTo(x, y + h, x, y, r2);
  ctx.arcTo(x, y, x + w, y, r2);
  ctx.closePath();
}


export function drawScene(
  ctx: CanvasRenderingContext2D,
  atl: Atlases,
  pipes: Pipe[],
  bird: { y: number; vy: number },
  wingPhase: number
) {
  
  ctx.drawImage(atl.bg, 0, 0);


  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];
    const topH = Math.max(0, p.gapY - p.gapH / 2);
    const bottomY = p.gapY + p.gapH / 2;
    const bottomH = Math.max(0, (VIEW_H - GROUND_H) - bottomY);

    
    if (topH > 14) {
      let drawn = 0;
      while (drawn < topH - 14) {
        const h = Math.min(200, topH - 14 - drawn);
        ctx.drawImage(atl.pipeBody, p.x, topH - 14 - drawn - h, PIPE_W, h);
        drawn += h;
      }
      ctx.drawImage(atl.pipeCap, p.x - 6, topH - 14);
    }

   
    if (bottomH > 14) {
      let drawn = 0;
      while (drawn < bottomH - 14) {
        const h = Math.min(200, bottomH - 14 - drawn);
        ctx.drawImage(atl.pipeBody, p.x, bottomY + 14 + drawn, PIPE_W, h);
        drawn += h;
      }
      ctx.drawImage(atl.pipeCap, p.x - 6, bottomY);
    }
  }


  const angle = Math.max(-0.55, Math.min(0.95, (bird.vy / 520))); // radians-ish
  const cx = BIRD_X;
  const cy = bird.y;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);


  const grad = ctx.createRadialGradient(-4, -4, 2, 0, 0, BIRD_R);
  grad.addColorStop(0, "#fde68a");
  grad.addColorStop(1, "#f59e0b");
  ctx.fillStyle = grad;
  ctx.strokeStyle = "rgba(0,0,0,.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, BIRD_R, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // belly highlight
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.beginPath();
  ctx.ellipse(-4, 6, 6, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // beak
  ctx.fillStyle = "#f97316";
  ctx.strokeStyle = "rgba(0,0,0,.2)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(BIRD_R - 2, -2);
  ctx.lineTo(BIRD_R + 8, 1);
  ctx.lineTo(BIRD_R - 2, 4);
  ctx.closePath();
  ctx.fill(); ctx.stroke();


  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(6, -6, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,.85)";
  ctx.beginPath(); ctx.arc(6.8, -5.2, 2.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath(); ctx.arc(7.4, -5.8, 0.8, 0, Math.PI * 2); ctx.fill();


  const flap = Math.sin(wingPhase * Math.PI * 2); // -1..1
  ctx.save();
  ctx.translate(-6, 0);
  ctx.rotate(flap * 0.8);
  ctx.fillStyle = "rgba(0,0,0,.15)";
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();

  
  ctx.drawImage(atl.ground, 0, VIEW_H - GROUND_H);
}
