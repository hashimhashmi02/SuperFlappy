import React from "react";
import GameCanvas from "./game/canvas/GameCanvas";

const App: React.FC = () => {
  return (
    <div className="min-h-dvh flex items-center justify-center p-3 sm:p-4">
      <div className="card w-full max-w-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="h1-tight">SuperFlappy</h1>
        </div>
        <GameCanvas />
      </div>
    </div>
  );
};

export default App;
