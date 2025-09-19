export function startLoop(cb: (dt: number) => void) {
  let raf = 0;
  let last = performance.now();

  const MAX_DT = 0.032;

  const frame = (now: number) => {
    const raw = (now - last) / 1000;
    const dt = raw > MAX_DT ? MAX_DT : raw;
    last = now;
    cb(dt);
    raf = requestAnimationFrame(frame);
  };

  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}
