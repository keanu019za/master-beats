// Web Audio API Electro-Acoustic Synthesizer Engine for Master & Beats

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying = false;
  private timerId: number | null = null;
  private step = 0;
  private currentTrackBpm = 130;
  private currentTrackIndex = 0;

  // Track melody & harmony configurations
  private readonly trackScales = [
    // Track 0: Balkan Cyberpunk (D minor harmonic)
    { root: 146.83, scale: [0, 2, 3, 5, 7, 8, 11, 12, 14, 15, 17, 19, 20, 23, 24], bpm: 132 },
    // Track 1: Subotica Nocturne (A minor)
    { root: 110.00, scale: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 20, 22, 24], bpm: 124 },
    // Track 2: Belgrade Neon Pulse (G minor)
    { root: 98.00, scale: [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 20, 22, 24], bpm: 135 },
    // Track 3: Kolo in the Matrix (E Phrygian dominant)
    { root: 164.81, scale: [0, 1, 4, 5, 7, 8, 10, 12, 13, 16, 17, 19, 20, 22, 24], bpm: 138 }
  ];

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public playTrack(trackIndex: number) {
    this.init();
    this.currentTrackIndex = trackIndex;
    const cfg = this.trackScales[trackIndex % this.trackScales.length];
    this.currentTrackBpm = cfg.bpm;

    if (this.isPlaying) {
      this.stop();
    }

    this.isPlaying = true;
    this.step = 0;
    this.scheduleNextStep();
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public resume() {
    if (!this.isPlaying) {
      this.init();
      this.isPlaying = true;
      this.scheduleNextStep();
    }
  }

  public stop() {
    this.pause();
    this.step = 0;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private scheduleNextStep() {
    if (!this.isPlaying || !this.ctx) return;

    const secondsPerBeat = 60.0 / this.currentTrackBpm;
    const stepDuration = secondsPerBeat / 4; // 16th notes

    this.playStepSound(this.step);
    this.step = (this.step + 1) % 64;

    this.timerId = window.setTimeout(() => {
      this.scheduleNextStep();
    }, stepDuration * 1000);
  }

  private playStepSound(currentStep: number) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const cfg = this.trackScales[this.currentTrackIndex % this.trackScales.length];

    // 1. Kick drum on beats 0, 4, 8, 12, etc. (four-on-the-floor)
    if (currentStep % 4 === 0) {
      this.triggerKick(now);
    }

    // 2. Cyber snare / clap on steps 4, 12 (backbeat)
    if (currentStep % 8 === 4) {
      this.triggerSnare(now);
    }

    // 3. Hi-hat on offbeats (2, 6, 10, 14...)
    if (currentStep % 2 === 1) {
      this.triggerHiHat(now, currentStep % 4 === 2 ? 0.08 : 0.04);
    }

    // 4. Sub Bassline (Rolling electro bass)
    if (currentStep % 2 === 0) {
      const bassNotes = [0, 0, 3, 0, 5, 0, 7, 5];
      const noteIdx = bassNotes[(currentStep / 2) % bassNotes.length];
      const freq = cfg.root * Math.pow(2, noteIdx / 12) * 0.5;
      this.triggerBass(now, freq);
    }

    // 5. Electric & Acoustic Accordion Lead Synth Arpeggio
    // Balkan accordion ornamentations: fast expressive runs
    const pattern = [0, 4, 7, 11, 12, 11, 7, 4, 2, 5, 8, 12, 14, 12, 8, 5];
    const semi = pattern[currentStep % pattern.length];
    const leadFreq = cfg.root * Math.pow(2, (semi + 12) / 12);

    // Only play on select steps to create rhythmic breathing
    if (currentStep % 8 !== 7) {
      // Alternates between Electric (magenta distorted saw) and Acoustic (warm triangle dual-reed)
      const isElectric = (Math.floor(currentStep / 8) % 2 === 0);
      this.triggerAccordionNote(now, leadFreq, isElectric);
    }
  }

  private triggerKick(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.09);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  private triggerSnare(time: number) {
    if (!this.ctx || !this.masterGain) return;
    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.15);
  }

  private triggerHiHat(time: number, volume: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(8000, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  private triggerBass(time: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, time);
    filter.frequency.exponentialRampToValueAtTime(100, time + 0.18);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  private triggerAccordionNote(time: number, freq: number, isElectric: boolean) {
    if (!this.ctx || !this.masterGain) return;

    // Accordion multi-reed synthesis: 2 detuned oscillators simulates musette accordion tuning
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    if (isElectric) {
      // Electric accordion: Miloš style (distorted aggressive saw, cyber bright)
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 1.004, time); // Subtle detune for shimmer

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, time);
      filter.Q.value = 2.5;

      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.16);
    } else {
      // Acoustic accordion: Dušan style (warm rich dual-reed musette)
      osc1.type = 'triangle';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq * 0.997, time); // Warm vibrato detune

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, time);

      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    }

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.22);
    osc2.stop(time + 0.22);
  }
}

export const soundEngine = new SoundEngine();
