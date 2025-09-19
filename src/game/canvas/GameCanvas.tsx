import React, { useEffect, useRef, useState } from "react";
import { startLoop } from "./engine";
import { makeAtlases, drawScene } from "./renderer";
import type { GameState, Pipe } from "./types";
import {
  VIEW_W, VIEW_H, GROUND_H,
  GRAVITY, JUMP_VELOCITY,
  INITIAL_GAP, MIN_GAP,
  INITIAL_SPEED, MAX_SPEED, PIPE_W, SPAWN_EVERY, BIRD_X, BIRD_R
} from "../constants";
import { Settings as Gear, Volume2, VolumeX, Share2, Pause, Play, RotateCcw } from "lucide-react";
import { sfx } from "../sfx";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function hitsBounds(y: number) { return (y - BIRD_R <= 0) || (y + BIRD_R >= VIEW_H - GROUND_H); }
function circleRect(cx: number, cy: number, r: number, rx: number, ry: number, rw: number, rh: number) {
  const cx2 = clamp(cx, rx, rx + rw), cy2 = clamp(cy, ry, ry + rh);
  const dx = cx - cx2, dy = cy - cy2;
  return (dx * dx + dy * dy) <= r * r;
}
function hitsPipes(y: number, pipes: Pipe[]) {
  const cx = BIRD_X, r = BIRD_R, left = cx - r, right = cx + r;
  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i], L = p.x, R = p.x + PIPE_W;
    if (right < L || left > R) continue;
    const topH = Math.max(0, p.gapY - p.gapH / 2);
    const bottomY = p.gapY + p.gapH / 2;
    const bottomH = Math.max(0, (VIEW_H - GROUND_H) - bottomY);
    if (topH > 0 && circleRect(cx, y, r, L, 0, PIPE_W, topH)) return true;
    if (bottomH > 0 && circleRect(cx, y, r, L, bottomY, PIPE_W, bottomH)) return true;
  }
  return false;
}

const BEST_KEY = "flappy_best_canvas_v3";
const SCORES_KEY = "flappy_scores_v1";

const GameCanvas: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [state, setState] = useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number>(() => Number(localStorage.getItem(BEST_KEY) ?? 0));
  const [showSettings, setShowSettings] = useState(false);
  const [muted, setMuted] = useState(false);
  const [leaders, setLeaders] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem(SCORES_KEY) || "[]"); } catch { return []; }
  });

  // physics & difficulty refs
  const yRef = useRef<number>(VIEW_H / 2);
  const vyRef = useRef<number>(0);
  const speedMulRef = useRef(1);
  const gapOffsetRef = useRef(0);

  // pipes
  const pipesRef = useRef<Pipe[]>([]);
  const spawnTimerRef = useRef(0);
  let PIPE_ID = 1;

  // atlases & DPR
  const atlRef = useRef<ReturnType<typeof makeAtlases> | null>(null);
  const dprRef = useRef<number>(Math.max(1, window.devicePixelRatio || 1));

  // wing anim
  const wingRef = useRef(0);

  // responsive canvas
  const resizeCanvas = () => {
    const c = canvasRef.current!, wrap = wrapperRef.current!;
    const targetW = Math.min(wrap.clientWidth, VIEW_W);
    const scale = targetW / VIEW_W;
    const cssW = VIEW_W * scale, cssH = VIEW_H * scale;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    dprRef.current = dpr;
    c.style.width = `${cssW}px`;
    c.style.height = `${cssH}px`;
    c.width = Math.floor(VIEW_W * dpr);
    c.height = Math.floor(VIEW_H * dpr);
    const ctx = c.getContext("2d")!;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(dpr, dpr);
    atlRef.current = makeAtlases(dpr);
  };
  useEffect(() => {
    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);
    return () => { ro.disconnect(); window.removeEventListener("resize", onResize); };
  }, []);

  // loop
  useEffect(() => {
    const c = canvasRef.current!, ctx = c.getContext("2d")!;
    if (!atlRef.current) atlRef.current = makeAtlases(dprRef.current);

    const stop = startLoop((dt) => {
      const draw = () => drawScene(ctx, atlRef.current!, pipesRef.current, { y: yRef.current, vy: vyRef.current } as any, wingRef.current);

      if (state !== "running") { wingRef.current = (wingRef.current + dt * 3) % 1; draw(); return; }

      const speedBase = INITIAL_SPEED + score * 4.5;
      const speed = clamp(speedBase * speedMulRef.current, 60, MAX_SPEED);
      const gapBase = INITIAL_GAP - score * 2.2;
      const gapH = clamp(gapBase + gapOffsetRef.current, MIN_GAP, 260);

      vyRef.current += GRAVITY * dt;
      yRef.current += vyRef.current * dt;

      const arr = pipesRef.current;
      for (let i = 0; i < arr.length; i++) arr[i].x -= speed * dt;
      while (arr.length && arr[0].x + PIPE_W < -20) arr.shift();

      spawnTimerRef.current -= dt;
      const interval = Math.max(0.9, SPAWN_EVERY - speed / 400);
      if (spawnTimerRef.current <= 0) {
        const safeTop = 80, safeBottom = VIEW_H - GROUND_H - 80;
        const gapY = clamp(rand(safeTop + gapH / 2, safeBottom - gapH / 2), safeTop + gapH / 2, safeBottom - gapH / 2);
        arr.push({ id: PIPE_ID++, x: VIEW_W + 40, gapY, gapH, passed: false });
        spawnTimerRef.current = interval;
      }

      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        if (!p.passed && p.x + PIPE_W < BIRD_X) {
          p.passed = true;
          setScore((s) => { if (!muted) sfx.score(); return s + 1; });
        }
      }

      const nextY = yRef.current + vyRef.current * dt;
      if (hitsBounds(nextY) || hitsPipes(nextY, arr)) {
        setState("gameover");
        setBest((b) => {
          const nb = Math.max(b, score);
          localStorage.setItem("flappy_best_canvas_v3", String(nb));
          return nb;
        });
        setLeaders((old) => {
          const next = [...old, score].sort((a, b) => b - a).slice(0, 10);
          localStorage.setItem("flappy_scores_v1", JSON.stringify(next));
          return next;
        });
        if (!muted) sfx.hit();
      }

      wingRef.current = (wingRef.current + dt * 6) % 1;
      draw();
    });

    return () => stop();
  }, [state, score, muted]);

  // input & pause on blur/hidden
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (state === "ready") setState("running");
        if (state === "running") { vyRef.current = JUMP_VELOCITY; if (!muted) sfx.flap(); }
      } else if (e.code === "KeyP") {
        setState((s) => (s === "running" ? "paused" : s === "paused" ? "running" : s));
      } else if (e.code === "KeyR") {
        doReset();
      } else if (e.code === "KeyO") {
        setShowSettings((v) => !v);
      } else if (e.code === "KeyM") {
        setMuted((m) => !m);
      }
    };
    const onBlur = () => { if (state === "running") setState("paused"); };
    const onVis = () => { if (document.hidden && state === "running") setState("paused"); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [state, muted]);

  const doReset = () => {
    setState("ready"); setScore(0);
    yRef.current = VIEW_H / 2; vyRef.current = 0;
    pipesRef.current = []; spawnTimerRef.current = 0;
  };

  const saveBadge = async () => {
    const w = 640, h = 320, dpr = 2;
    const can = document.createElement("canvas"); can.width = w * dpr; can.height = h * dpr;
    const ctx = can.getContext("2d")!; ctx.scale(dpr, dpr);
    const grd = ctx.createLinearGradient(0,0,0,h); grd.addColorStop(0,"#dbeafe"); grd.addColorStop(1,"#fef3c7");
    ctx.fillStyle = grd; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = "#111827"; ctx.font = "700 28px system-ui"; ctx.fillText("SuperFlappy — High Score", 24, 48);
    ctx.font = "800 92px system-ui"; ctx.fillText(String(best), 24, 140);
    ctx.font = "400 20px system-ui"; ctx.fillText("Best", 24, 168);
    ctx.font = "700 22px system-ui"; ctx.fillText("Recent Top Scores", 24, 210);
    ctx.font = "500 20px system-ui";
    leaders.slice(0,5).forEach((s,i)=>ctx.fillText(`${i+1}. ${s}`, 24, 240 + i*26));
    ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.font = "400 14px system-ui"; ctx.fillText("Made with React + Canvas", 24, h-16);
    const a = document.createElement("a"); a.href = can.toDataURL("image/png"); a.download = `superflappy-highscore-${best}.png`; a.click();
  };

  return (
    <div className="w-full">
      {/* Compact HUD */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold space-x-3">
          <span>Score: <span className="tabular-nums">{score}</span></span>
          <span className="text-black/60">Best: <span className="tabular-nums">{best}</span></span>
        </div>
        <div className="toolbar">
          {state !== "running" ? (
            <button className="btn btn-sm" onClick={() => setState("running")} title="Start (Space)">
              <Play className="h-4 w-4" /><span className="hidden sm:inline">Start</span>
            </button>
          ) : (
            <button className="btn-ghost btn-sm" onClick={() => setState("paused")} title="Pause (P)">
              <Pause className="h-4 w-4" /><span className="hidden sm:inline">Pause</span>
            </button>
          )}
          <button className="btn-ghost btn-sm" onClick={doReset} title="Reset (R)">
            <RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">Reset</span>
          </button>
          <button className="btn-ghost btn-sm" onClick={() => setShowSettings(v => !v)} title="Settings (O)">
            <Gear className="h-4 w-4" /><span className="hidden sm:inline">Settings</span>
          </button>
          <button className="btn-ghost btn-sm" onClick={() => setMuted(m => !m)} title="Mute (M)">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button className="btn-ghost btn-sm" onClick={saveBadge} title="Save Badge">
            <Share2 className="h-4 w-4" /><span className="hidden sm:inline">Badge</span>
          </button>
        </div>
      </div>

      {/* Centered, responsive canvas */}
      <div ref={wrapperRef} className="w-full flex justify-center">
        <canvas
          ref={canvasRef}
          style={{ display: "block", margin: "0 auto", borderRadius: 16, border: "1px solid rgba(255,255,255,.6)" }}
          onMouseDown={() => { if (state === "ready") setState("running"); if (state === "running") { vyRef.current = JUMP_VELOCITY; if (!muted) sfx.flap(); } }}
          onTouchStart={(e) => { e.preventDefault(); if (state === "ready") setState("running"); if (state === "running") { vyRef.current = JUMP_VELOCITY; if (!muted) sfx.flap(); } }}
        />
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="mt-3 grid grid-cols-1 gap-3 card p-3">
          <label className="text-sm">
            <span className="block mb-1">Speed × <b>{speedMulRef.current.toFixed(2)}</b></span>
            <input type="range" min={0.7} max={1.4} step={0.01} defaultValue={1}
              onChange={(e) => (speedMulRef.current = parseFloat(e.target.value))}
              className="w-full accent-brand-600" />
          </label>
          <label className="text-sm">
            <span className="block mb-1">Gap offset <b>{gapOffsetRef.current}px</b></span>
            <input type="range" min={-80} max={80} step={1} defaultValue={0}
              onChange={(e) => (gapOffsetRef.current = parseInt(e.target.value))}
              className="w-full accent-brand-600" />
          </label>
          <p className="text-xs text-black/60">Space: flap • P: pause • R: reset • O: settings • M: mute</p>
        </div>
      )}

      {/* Leaderboard */}
      {leaders.length > 0 && (
        <div className="mt-3 card p-3">
          <h4 className="font-semibold mb-1">Local Leaderboard</h4>
          <ol className="list-decimal ml-5 space-y-0.5 text-sm">
            {leaders.map((s, i) => <li key={i} className="tabular-nums">{s}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
