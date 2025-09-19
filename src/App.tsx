import { RotateCcw, Play } from "lucide-react";
import React from "react";

const App: React.FC = () => {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Flappy Bird</h1>
          <span className="text-xs text-black/50"></span>
        </div>

        <div className="relative aspect-[3/5] overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-b from-sky-200/70 to-amber-100/70 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl" aria-hidden>🐤</div>
            <p className="mt-3 text-black/70">
              Physics & pipes
            </p>
          </div>

          {/* decorative clouds */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-6 -left-10 h-24 w-24 rounded-full bg-white/60 blur-2xl" />
            <div className="absolute top-6 right-4 h-16 w-28 rounded-full bg-white/60 blur-xl" />
            <div className="absolute bottom-10 left-8 h-10 w-20 rounded-full bg-white/70 blur-xl" />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button className="btn" disabled>
            <Play className="h-5 w-5" />
            Start
          </button>
          <button className="btn-ghost" type="button">
            <RotateCcw className="h-5 w-5" />
            Reset
          </button>
        </div>

        <p className="mt-4 text-sm text-black/60">
          
        </p>
      </div>
    </div>
  );
};

export default App;
