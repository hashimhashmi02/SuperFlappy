let ctx: AudioContext | null = null;
const ensure = () => (ctx ||= new (window.AudioContext || (window as any).webkitAudioContext)());

function blip(freq: number, dur = 0.08, type: OscillatorType = "sine", gain = 0.05) {
  const ac = ensure();
  const t = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + dur + 0.03);
}

export const sfx = {
  flap: () => blip(900, 0.06, "triangle", 0.04),
  score: () => { blip(650, 0.06, "square", 0.04); setTimeout(() => blip(820, 0.06, "square", 0.035), 60); },
  hit: () => blip(160, 0.15, "sawtooth", 0.06),
};
