export type GameState = "ready" | "running" | "paused" | "gameover";

export interface Pipe {
  id: number;
  x: number;      
  gapY: number;  
  gapH: number;
  passed: boolean;
}
