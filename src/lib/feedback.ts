// Lightweight multimodal feedback: audio tone + optional haptic vibration.

export const shouldReduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isAndroid = () => /Android/i.test(navigator.userAgent || '');

export const haptic = (duration = 20) => {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && isAndroid()) {
      // Pattern can feel more tactile than constant vibration on Android
      const pattern = Array.isArray(duration) ? duration : [duration, 20, Math.max(10, duration - 5)];
      (navigator as any).vibrate?.(pattern);
    }
  } catch {}
};

let audioCtx: AudioContext | null = null;
export const playTone = async (frequency = 880, durationMs = 120, gain = 0.05) => {
  try {
    if (typeof window === 'undefined' || !(window as any).AudioContext) return;
    audioCtx = audioCtx || new (window as any).AudioContext();
    const ctx = audioCtx;
    if (ctx.state === 'suspended') await ctx.resume();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    g.gain.value = gain; // low volume
    osc.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    // Envelope to avoid click
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
    osc.start(now);
    osc.stop(now + durationMs / 1000 + 0.01);
  } catch {}
};

export const playTada = async () => {
  try {
    if (typeof window === 'undefined' || !(window as any).AudioContext) return;
    audioCtx = audioCtx || new (window as any).AudioContext();
    const ctx = audioCtx;
    if (ctx.state === 'suspended') await ctx.resume();
    const now = ctx.currentTime;
    const seq = [784, 988, 1319]; // G5, B5, E6
    const step = 0.08;
    seq.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.value = 0.06;
      osc.connect(g);
      g.connect(ctx.destination);
      const t0 = now + i * step;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.06, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + step);
      osc.start(t0);
      osc.stop(t0 + step + 0.02);
    });
  } catch {}
};

export const fireFeedback = (done: boolean) => {
  // Differentiate done vs undo subtly
  if (done) {
    playTone(880, 120, 0.06);
    haptic([18, 20, 15]);
  } else {
    playTone(440, 90, 0.05);
    haptic([12, 15, 10]);
  }
};
