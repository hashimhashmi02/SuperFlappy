import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import {
  BIRD_R,
  BIRD_X,
  GRAVITY,
  INITIAL_GAP,
  INITIAL_SPEED,
  MAX_SPEED,
  MIN_GAP,
  VIEW_H,
  VIEW_W,
  GROUND_H,
  JUMP_VELOCITY,
} from "./constants";
import { useGameLoop } from "./useGameLoop";
import { usePipes } from "./usePipes";
import Bird from "./components/Bird";
import Pipe from "./components/Pipe";
import { birdHitsBounds, birdHitsPipes, checkPassAndScore } from "./utils/collisions";
import type { GameState } from "./types";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const BEST_KEY = "flappy_best_v1";

const Game: React.FC = () => {
  const [state, setState] = useState<GameState>("ready");
  const [birdY, setBirdY] = useState<number>(VIEW_H / 2);
  const [vy, setVy] = useState<number>(0);

  const [score, setScore] = useState<number>(0);
  const [best, setBest] = useState<number>(() => {
    const v = localStorage.getItem(BEST_KEY);
    return v ? Number(v) : 0;
  });

  // difficulty scales with score
  const speed = useMemo(() => Math.min(MAX_SPEED, INITIAL_SPEED + score * 4.5), [score]);
  const gapH = useMemo(() => Math.max(MIN_GAP, INITIAL_GAP - score * 2.2), [score]);

  const { pipes, update: updatePipes, reset: resetPipes } = usePipes();

  const jump = useCallback(() => {
    if (state === "ready") setState("running");
    if (state === "running") setVy(JUMP_VELOCITY);
  }, [state]);

  const hardReset = useCallback(() => {
    setState("ready");
    setBirdY(VIEW_H / 2);
    setVy(0);
    setScore(0);
    resetPipes();
  }, [resetPipes]);

  // keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      } else if (e.code === "KeyP") {
        setState(s => (s === "running" ? "paused" : s === "paused" ? "running" : s));
      } else if (e.code === "KeyR") {
        hardReset();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, hardReset]);

  // scoring when pipes pass bird
  useEffect(() => {
    checkPassAndScore(pipes, (pipeId) => {
      setScore((s) => s + 1);
      // mark passed for immutability — we rebuild pipes in hook, so nothing to toggle here
      // (pass detection simply fires once as the x+w < BIRD_X condition flips)
    });
  }, [pipes]);

  const update = useCallback((dt: number) => {
    if (state !== "running") return;

    // physics
    setVy((v) => v + GRAVITY * dt);
    setBirdY((y) => y + vy * dt);

    // pipes + scrolling
    updatePipes(dt, speed, gapH);

    // collisions
    const hitBounds = birdHitsBounds(birdY + vy * dt, BIRD_R);
    const hitPipe = birdHitsPipes(birdY + vy * dt, BIRD_R, pipes);

    if (hitBounds || hitPipe) {
      setState("gameover");
      setBest((b) => {
        const nb = Math.max(b, score);
        localStorage.setItem(BEST_KEY, String(nb));
        return nb;
      });
    }
  }, [gapH, pipes, score, speed, state, updatePipes, vy, birdY]);

  useGameLoop(state === "running", update);

  // responsive scale so fixed game coords map nicely
  const scale = useMemo(() => {
    // scale to parent width if needed using CSS, but we keep fixed intrinsic size
    return 1;
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold">
          Score: <span className="tabular-nums">{score}</span>
        </div>
        <div className="text-sm text-black/60">
          Best: <span className="tabular-nums">{best}</span>
        </div>
      </div>

      <div
        className="relative rounded-2xl border border-white/60 overflow-hidden shadow-soft"
        style={{ width: VIEW_W * scale, height: VIEW_H * scale, background: "linear-gradient(180deg,#dbeafe 0%,#fef3c7 100%)" }}
        onMouseDown={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
        role="button"
        aria-label="game area"
      >
        {/* sky clouds (decor) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-6 -left-10 h-24 w-24 rounded-full bg-white/60 blur-2xl" />
          <div className="absolute top-6 right-4 h-16 w-28 rounded-full bg-white/60 blur-xl" />
          <div className="absolute bottom-24 left-8 h-10 w-20 rounded-full bg-white/70 blur-xl" />
        </div>

        {/* pipes */}
        {pipes.map((p) => (
          <Pipe key={p.id} x={p.x} gapY={p.gapY} gapH={p.gapH} />
        ))}

        {/* bird */}
        <div style={{ position: "absolute", left: BIRD_X - BIRD_R, top: 0 }}>
          <Bird y={birdY - BIRD_R} vy={vy} state={state} />
        </div>

        {/* ground */}
        <div
          className="absolute left-0 right-0"
          style={{
            bottom: 0,
            height: GROUND_H,
            background:
              "repeating-linear-gradient(45deg, rgba(0,0,0,.05) 0 10px, rgba(0,0,0,.08) 10px 20px), linear-gradient(180deg,#fef08a 0%, #f59e0b 100%)",
            borderTop: "1px solid rgba(0,0,0,.08)",
          }}
        />

        {/* overlays */}
        {state !== "running" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="card px-6 py-5 text-center">
              {state === "ready" && (
                <>
                  <h2 className="text-lg font-semibold">Tap / Space to start</h2>
                  <p className="text-sm text-black/60 mt-1">Press <kbd>Space</kbd> or click to flap • <kbd>P</kbd> pause • <kbd>R</kbd> reset</p>
                </>
              )}
              {state === "paused" && (
                <h2 className="text-lg font-semibold">Paused</h2>
              )}
              {state === "gameover" && (
                <>
                  <h2 className="text-lg font-semibold">Game Over</h2>
                  <p className="text-sm text-black/60 mt-1">Score {score} • Best {best}</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* controls */}
      <div className="mt-4 flex items-center gap-3">
        {state !== "running" ? (
          <button className="btn" onClick={() => setState(s => (s === "ready" ? "running" : "running"))}>
            <Play className="h-5 w-5" />
            {state === "gameover" ? "Play again" : "Start"}
          </button>
        ) : (
          <button className="btn-ghost" onClick={() => setState("paused")}>
            <Pause className="h-5 w-5" />
            Pause
          </button>
        )}
        <button className="btn-ghost" onClick={hardReset}>
          <RotateCcw className="h-5 w-5" />
          Reset
        </button>
        {state === "paused" && (
          <button className="btn" onClick={() => setState("running")}>
            <Play className="h-5 w-5" />
            Resume
          </button>
        )}
      </div>
    </div>
  );
};

export default Game;
