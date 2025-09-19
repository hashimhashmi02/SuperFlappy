SuperFlappy is a polished Flappy Bird re-build focused on fundamentals and feel.
It uses a Canvas renderer (React for UI only) to keep the game loop silky smooth, and Tailwind for a compact, modern UI.

Highlights

⚡ Fast: Canvas draw loop (no React re-render per frame) for stable FPS

📱 Responsive: Scales to mobile; crisp DPR rendering

⏸️ Smart: Auto pause on tab blur / visibility change

🔊 SFX + Mute: Tiny WebAudio blips for flap/score/hit with one-click mute

🧪 Tuning: In-app settings (speed ×, gap offset) for practice

🏆 Local Leaderboard: Saves top 10 scores in localStorage

🖼️ Share Badge: Export a PNG of your best score

🎨 Pretty: Clean Tailwind UI, glossy pipes, wing-flap bird

Controls

Space/Click/Tap = Flap

P = Pause / Resume

R = Reset

O = Toggle Settings

M = Mute / Unmute

Tech

React + TypeScript

Canvas renderer (custom loop)

Tailwind CSS

Deploy

Vite build → dist/

Works out-of-the-box on Vercel (Build: npm run build, Output: dist)
