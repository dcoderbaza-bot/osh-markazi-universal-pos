// Web Audio API Sound Effects for POS, KDS & Electronic Queue

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  playBeep(freq = 880, duration = 0.08, type = "sine", volume = 0.12) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // ignore audio autoplay restrictions
    }
  }

  playPosTap() {
    this.playBeep(720, 0.04, "triangle", 0.08);
  }

  playCashRegister() {
    if (!this.enabled) return;
    this.playBeep(987.77, 0.09, "sine", 0.15); // B5
    setTimeout(() => this.playBeep(1318.51, 0.22, "sine", 0.18), 90); // E6
  }

  playQueueDingDong() {
    if (!this.enabled) return;
    this.playBeep(783.99, 0.28, "sine", 0.22); // G5
    setTimeout(() => this.playBeep(659.25, 0.45, "sine", 0.22), 260); // E5
  }

  playNewOrderBell() {
    if (!this.enabled) return;
    this.playBeep(1046.5, 0.15, "sine", 0.2);
    setTimeout(() => this.playBeep(1318.5, 0.25, "sine", 0.2), 150);
  }
}

export const sound = new SoundEngine();

export function formatMoney(amount, currency = "so'm") {
  const num = Number(amount) || 0;
  return `${num.toLocaleString("ru-RU")} ${currency}`;
}
