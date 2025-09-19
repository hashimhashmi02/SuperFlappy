export type GameState = "ready" | "running" | "paused" | "gameover";

export interface Pipe {

    id: number;
    x: number;
    gapY : number;
    gapH: number;
    passed: boolean;
}

export interface CollisionRect{
    [x: string]: number;
    y: number;
    x : number;
    Y : number;
    W : number;
    h : number;
}