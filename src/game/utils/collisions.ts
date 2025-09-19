import type { CollisionRect, Pipe } from "../types";
import { BIRD_R, BIRD_X, GROUND_H, PIPE_W, VIEW_H } from "../constants";

export function circleRectCollision(
  cx: number, cy: number, r: number,
  rect: CollisionRect
): boolean {
  const closestX = clamp(cx, rect.x, rect.x + rect.w);
  const closestY = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) <= r * r;
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export function birdHitsBounds(birdY: number, r: number): boolean {
  if (birdY - r <= 0) return true; 
  if (birdY + r >= VIEW_H - GROUND_H) return true; 
  return false;
}

export function birdHitsPipes(birdY: number, r: number, pipes: Pipe[]): boolean {
  for (const p of pipes) {
    const topRect: CollisionRect = {
      x: p.x, y: 0, w: PIPE_W, h: p.gapY - p.gapH / 2,
      Y: 0,
      W: 0
    };
    const bottomRect: CollisionRect = {
      x: p.x, y: p.gapY + p.gapH / 2, w: PIPE_W, h: (VIEW_H - GROUND_H) - (p.gapY + p.gapH / 2),
      Y: 0,
      W: 0
    };
    if (circleRectCollision(BIRD_X, birdY, r, topRect)) return true;
    if (circleRectCollision(BIRD_X, birdY, r, bottomRect)) return true;
  }
  return false;
}

export function checkPassAndScore(
  pipes: Pipe[],
  onPass: (pipeId: number) => void
) {
  for (const p of pipes) {
    if (!p.passed && (p.x + PIPE_W) < BIRD_X) {
      onPass(p.id);
    }
  }
}
