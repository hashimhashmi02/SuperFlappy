import React from "react";
import Game from "./game/Game";
import { RotateCcw } from "lucide-react";

const App: React.FC = () => {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="card w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Flappy Bird — React + Tailwind</h1>
          <span className="text-xs text-black/50">Step 2: Playable</span>
        </div>

        <Game />

        <p className="mt-4 text-sm text-black/60">
          Tap/Space to flap • P pause • R reset
        </p>
      </div>
    </div>
  );
};

export default App;
