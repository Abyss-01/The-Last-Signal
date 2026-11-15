/**
 * SoundEngine — procedural Web Audio layers for the expedition.
 *
 *   1. Environment drones (one per world: launch wind, cislunar hum,
 *      lunar near-silence, era transition, Martian wind).
 *   2. Restrained UI clicks.
 *   3. Launch rumble — heard only inside Earth's atmosphere and faded out
 *      well before orbit. Strictly no explosion or external sound effects
 *      in the vacuum of space.
 *   4. Optional narration via the Web Speech API, caption-synced by the
 *      HUD.
 *
 * Fully usable while muted; the context starts only after a user gesture.
 */

export type SoundEnvironment = 'earth' | 'cislunar' | 'moon' | 'transition'

interface EnvironmentProfile {
  droneGain: number
  filterFreq: number
  filterQ: number
  oscAFreq: number
  oscBFreq: number
  oscAGain: number
  oscBGain: number
  lfoDepth: number
}

const PROFILES: Record<SoundEnvironment, EnvironmentProfile> = {
  earth: {
    droneGain: 0.16,
    filterFreq: 420,
    filterQ: 0.8,
    oscAFreq: 55,
    oscBFreq: 82,
    oscAGain: 0.05,
    oscBGain: 0.03,
    lfoDepth: 90,
  },
  cislunar: {
    droneGain: 0.1,
    filterFreq: 210,
    filterQ: 2.4,
    oscAFreq: 44,
    oscBFreq: 66,
    oscAGain: 0.045,
    oscBGain: 0.02,
    lfoDepth: 14,
  },
  moon: {
    droneGain: 0.045,
    filterFreq: 140,
    filterQ: 3,
    oscAFreq: 30,
    oscBFreq: 90,
    oscAGain: 0.03,
    oscBGain: 0.008,
    lfoDepth: 4,
  },
  transition: {
    droneGain: 0.09,
    filterFreq: 340,
    filterQ: 1.6,
    oscAFreq: 110,
    oscBFreq: 164,
    oscAGain: 0.03,
    oscBGain: 0.02,
    lfoDepth: 30,
  },
}

class SoundEngineImpl {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private droneGain: GainNode | null = null
  private droneFilter: BiquadFilterNode | null = null
  private oscA: OscillatorNode | null = null
  private oscB: OscillatorNode | null = null
  private oscAGain: GainNode | null = null
  private oscBGain: GainNode | null = null
  private lfoGain: GainNode | null = null
  private rumbleGain: GainNode | null = null
  private started = false
  private muted = false
  private volume = 0.6
  private environment: SoundEnvironment = 'cislunar'

  /** Must be called from a user gesture; safe to call repeatedly. */
  start(): void {
    if (this.started || typeof window === 'undefined') return
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return
    this.started = true
    const ctx = new Ctor()
    this.ctx = ctx

    this.master = ctx.createGain()
    this.master.gain.value = this.muted ? 0 : this.volume
    this.master.connect(ctx.destination)

    // Shared noise source (looped white noise).
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    const noise = ctx.createBufferSource()
    noise.buffer = noiseBuffer
    noise.loop = true

    this.droneFilter = ctx.createBiquadFilter()
    this.droneFilter.type = 'bandpass'
    const profile = PROFILES[this.environment]
    this.droneFilter.frequency.value = profile.filterFreq
    this.droneFilter.Q.value = profile.filterQ

    this.droneGain = ctx.createGain()
    this.droneGain.gain.value = profile.droneGain

    noise.connect(this.droneFilter)
    this.droneFilter.connect(this.droneGain)
    this.droneGain.connect(this.master)
    noise.start()

    // Wind gusting (more audible on Mars / Earth).
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07
    this.lfoGain = ctx.createGain()
    this.lfoGain.gain.value = profile.lfoDepth
    lfo.connect(this.lfoGain)
    this.lfoGain.connect(this.droneFilter.frequency)
    lfo.start()

    // Tonal drones.
    this.oscA = ctx.createOscillator()
    this.oscA.type = 'sine'
    this.oscA.frequency.value = profile.oscAFreq
    this.oscAGain = ctx.createGain()
    this.oscAGain.gain.value = profile.oscAGain
    this.oscA.connect(this.oscAGain)
    this.oscAGain.connect(this.master)
    this.oscA.start()

    this.oscB = ctx.createOscillator()
    this.oscB.type = 'triangle'
    this.oscB.frequency.value = profile.oscBFreq
    this.oscBGain = ctx.createGain()
    this.oscBGain.gain.value = profile.oscBGain
    this.oscB.connect(this.oscBGain)
    this.oscBGain.connect(this.master)
    this.oscB.start()

    // Launch rumble (Earth atmosphere only; driven by scroll progress).
    const rumbleFilter = ctx.createBiquadFilter()
    rumbleFilter.type = 'lowpass'
    rumbleFilter.frequency.value = 70
    this.rumbleGain = ctx.createGain()
    this.rumbleGain.gain.value = 0
    noise.connect(rumbleFilter)
    rumbleFilter.connect(this.rumbleGain)
    this.rumbleGain.connect(this.master)
  }

  setEnvironment(env: SoundEnvironment): void {
    if (env === this.environment || !this.ctx) return
    this.environment = env
    const p = PROFILES[env]
    const t = this.ctx.currentTime
    const ramp = (param: AudioParam, value: number, time = 2.4) => {
      param.cancelScheduledValues(t)
      param.setTargetAtTime(value, t, time / 3)
    }
    if (this.droneFilter) ramp(this.droneFilter.frequency, p.filterFreq)
    if (this.droneGain) ramp(this.droneGain.gain, p.droneGain)
    if (this.oscA) this.oscA.frequency.setTargetAtTime(p.oscAFreq, t, 1.2)
    if (this.oscB) this.oscB.frequency.setTargetAtTime(p.oscBFreq, t, 1.2)
    if (this.oscAGain) ramp(this.oscAGain.gain, p.oscAGain)
    if (this.oscBGain) ramp(this.oscBGain.gain, p.oscBGain)
    if (this.lfoGain) ramp(this.lfoGain.gain, p.lfoDepth)
  }

  /** 0 → 1 launch rumble intensity (applied only in-atmosphere upstream). */
  setRumble(intensity: number): void {
    if (!this.rumbleGain || !this.ctx) return
    const t = this.ctx.currentTime
    this.rumbleGain.gain.setTargetAtTime(
      Math.max(0, Math.min(1, intensity)) * 0.5,
      t,
      0.25,
    )
  }

  /** Short, restrained UI click. */
  click(): void {
    if (!this.ctx || !this.master || this.muted) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(920, t)
    osc.frequency.exponentialRampToValueAtTime(1380, t + 0.05)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
    osc.connect(gain)
    gain.connect(this.master)
    osc.start(t)
    osc.stop(t + 0.1)
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.15)
    }
    if (muted) this.stopNarration()
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    if (this.master && this.ctx && !this.muted) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.15)
    }
  }

  /** Optional caption-synced narration (Web Speech API). */
  narrate(text: string): void {
    if (this.muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    this.stopNarration()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 0.9
    utterance.volume = this.muted ? 0 : Math.min(1, this.volume * 1.4)
    window.speechSynthesis.speak(utterance)
  }

  stopNarration(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
  }

  dispose(): void {
    this.stopNarration()
    this.ctx?.close()
    this.ctx = null
    this.started = false
  }
}

/** App-wide shared instance. */
export const soundEngine = new SoundEngineImpl()
