/**
 * audio.js
 * Generative deep-space ambient audio synthesizer and UI feedback sounds
 * built using the Web Audio API (zero external assets).
 * Inspired by aerospace mission telemetry and cinematic soundscapes.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.droneGain = null;
    this.oscillators = [];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();

    // Master drone gain
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.droneGain.connect(this.ctx.destination);

    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);
    filter.Q.setValueAtTime(4.0, this.ctx.currentTime);
    filter.connect(this.droneGain);

    // Osc 1 (Sub drone - 55 Hz)
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, this.ctx.currentTime);
    osc1.connect(filter);
    osc1.start();
    this.oscillators.push(osc1);

    // Osc 2 (Harmonic detune - 110.5 Hz)
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(110.5, this.ctx.currentTime);
    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    osc2.connect(osc2Gain);
    osc2Gain.connect(filter);
    osc2.start();
    this.oscillators.push(osc2);

    // Subtle LFO for breathing drone movement
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // 8-second breathing cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(30, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    this.oscillators.push(lfo);
  }

  toggle() {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;

    if (this.droneGain) {
      const now = this.ctx.currentTime;
      if (this.isMuted) {
        this.droneGain.gain.cancelScheduledValues(now);
        this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
        this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      } else {
        this.droneGain.gain.cancelScheduledValues(now);
        this.droneGain.gain.setValueAtTime(0.0001, now);
        this.droneGain.gain.exponentialRampToValueAtTime(0.18, now + 1.2);
        this.playChirp(880, 0.05, 0.08);
      }
    }

    return !this.isMuted;
  }

  playChirp(freq = 960, duration = 0.04, volume = 0.05) {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio autoplay or permissions safe
    }
  }

  playStageTransition() {
    this.playChirp(620, 0.06, 0.06);
  }
}

export const soundEngine = new SoundEngine();
