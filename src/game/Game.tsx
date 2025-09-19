import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Settings as Gear } from "lucide-react";
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
import { birdHitsBounds, birdHitsPipes } from "./utils/collisions";
import type { GameState } from "./types";
import { motion } from "framer-motion";
import Parallax from "./components/Parallax";
import Particles from "./components/Particles";
import { useParticles } from "./useParticles";
import { sfxFlap, sfxHit, sfxScore } from "./sfx";

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

const BEST_KEY = "flappy_best_v3";

const Game: React.FC = () => {
  const [state, setState] = useState<GameState>("ready");


  const [birdY, setBirdY] = useState<number>(VIEW_H / 2);
  const [vy, setVy] = useState<number>(0);

  const yRef = useRef<number>(VIEW_H / 2);
  const vyRef = useRef<number>(0);

  const [score, setScore] = useState<number>(0);
  const [best, setBest] = useState<number>(() => Number(localStorage.getItem(BEST_KEY) ?? 0));


  const [speedMul, setSpeedMul] = useState<number>(1);
  const [gapOffset, setGapOffset] = useState<number>(0);
  const [showSettings, setShowSettings] = useState(false);

  const baseSpeed = useMemo(() => INITIAL_SPEED + score * 4.5, [score]);
  const speed = useMemo(() => clamp(baseSpeed * speedMul, 60, MAX_SPEED), [baseSpeed, speedMul]);
  const baseGap = useMemo(() => INITIAL_GAP - score * 2.2, [score]);
  const gapH = useMemo(() => clamp(baseGap + gapOffset, MIN_GAP, 260), [baseGap, gapOffset]);

  const { pipes, update: updatePipes, reset: resetPipes } = usePipes();


  const [worldX, setWorldX] = useState(0);

  const { particles, emitBurst, update: updateParticles, reset: resetParticles } = useParticles();

  const jump = useCallback(() => {
    if (state === "ready") setState("running");
    if (state === "running") {
      vyRef.current = JUMP_VELOCITY;
      setVy(vyRef.current);
      emitBurst(BIRD_X, yRef.current);
      sfxFlap();
    }
  }, [state, emitBurst]);

  const hardReset = useCallback(() => {
    setState("ready");
    setScore(0);

    yRef.current = VIEW_H / 2;
    vyRef.current = 0;
    setBirdY(yRef.current);
    setVy(vyRef.current);
    resetPipes();
    resetParticles();
    setWorldX(0);
  }, [resetPipes, resetParticles]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault(); jump();
      } else if (e.code === "KeyP") {
        setState(s => (s === "running" ? "paused" : s === "paused" ? "running" : s));
      } else if (e.code === "KeyR") {
        hardReset();
      } else if (e.code === "KeyO") {
        setShowSettings(v => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, hardReset]);

  const endGame = useCallback(() => {
    setState("gameover");
    setBest(b => {
      const nb = Math.max(b, score);
      localStorage.setItem(BEST_KEY, String(nb));
      return nb;
    });
    sfxHit();
  }, [score]);


  const [scoreKey, setScoreKey] = useState(0);


  const onUpdate = useCallback((dt: number) => {
    if (state !== "running") return;


    vyRef.current += GRAVITY * dt;
    yRef.current += vyRef.current * dt;

    setWorldX(w => w + speed * dt);
    updateParticles(dt);

    updatePipes(dt, speed, gapH, () => {
      setScore(s => s + 1);
      setScoreKey(k => k + 1);
      sfxScore();
    });

  
    const nextY = yRef.current + vyRef.current * dt;
    if (birdHitsBounds(nextY, BIRD_R) || birdHitsPipes(nextY, BIRD_R, pipes)) {
      endGame();
      return;
    }

    setBirdY(yRef.current);
    setVy(vyRef.current);
  }, [state, speed, gapH, updatePipes, updateParticles, pipes, endGame]);

  useGameLoop(state === "running", onUpdate);

  return (
    <div className="w-full">

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold">
          Score:{" "}
          <motion.span
            key={scoreKey}
            className="tabular-nums inline-block"
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 18 }}
          >
            {score}
          </motion.span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-black/60">
            Best: <span className="tabular-nums">{best}</span>
          </div>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => setShowSettings(v => !v)}
            title="Settings (O)"
          >
            <Gear className="h-5 w-5" />
            Settings
          </button>
        </div>
      </div>


      <div
        className="relative rounded-2xl border border-white/60 overflow-hidden shadow-soft"
        style={{ width: VIEW_W, height: VIEW_H, background: "linear-gradient(180deg,#dbeafe 0%,#fef3c7 100%)" }}
        onMouseDown={jump}
        onTouchStart={(e) => { e.preventDefault(); jump(); }}
        role="button"
        aria-label="game area"
      >
        <Parallax worldX={worldX} />

    
        {pipes.map((p) => (
          <Pipe key={p.id} x={p.x} gapY={p.gapY} gapH={p.gapH} />
        ))}

   
        <Particles items={particles} />

       
        <div style={{ position: "absolute", left: BIRD_X - BIRD_R, top: 0 }}>
          <Bird y={birdY - BIRD_R} vy={vy} state={state} />
        </div>

 
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

     
        {state !== "running" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="card px-6 py-5 text-center">
              {state === "ready" && (
                <>
                  <h2 className="text-lg font-semibold">Tap / Space to start</h2>
                  <p className="text-sm text-black/60 mt-1">
                    <kbd>Space</kbd> flap • <kbd>P</kbd> pause • <kbd>R</kbd> reset • <kbd>O</kbd> settings
                  </p>
                </>
              )}
              {state === "paused" && <h2 className="text-lg font-semibold">Paused</h2>}
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

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        {state !== "running" ? (
          <button className="btn" onClick={() => setState("running")}>
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
      </div>

   
      {showSettings && (
        <div className="mt-4 p-4 card">
          <h3 className="font-semibold mb-3">Settings</h3>
          <div className="grid grid-cols-1 gap-4">
            <label className="text-sm">
              <span className="block mb-1">Speed multiplier: <b>{speedMul.toFixed(2)}×</b></span>
              <input
                type="range"
                min={0.7}
                max={1.4}
                step={0.01}
                value={speedMul}
                onChange={(e) => setSpeedMul(parseFloat(e.target.value))}
                className="w-full accent-brand-600"
              />
            </label>
            <label className="text-sm">
              <span className="block mb-1">Gap offset: <b>{gapOffset}px</b></span>
              <input
                type="range"
                min={-80}
                max={80}
                step={1}
                value={gapOffset}
                onChange={(e) => setGapOffset(parseInt(e.target.value))}
                className="w-full accent-brand-600"
              />
            </label>
            <p className="text-xs text-black/60">
              Tip: lower speed or higher gap to practice. Press <kbd>O</kbd> to toggle this panel.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
