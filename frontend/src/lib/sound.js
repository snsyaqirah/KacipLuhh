let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

export function playPing() {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, c.currentTime + 0.12);
    gain.gain.setValueAtTime(0.18, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.4);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.4);
  } catch {}
}

export const sound = {
  isEnabled: () => localStorage.getItem('kacip_sound') !== 'off',
  toggle: () => {
    const next = !sound.isEnabled();
    localStorage.setItem('kacip_sound', next ? 'on' : 'off');
    return next;
  },
  play: () => { if (sound.isEnabled()) playPing(); },
};
