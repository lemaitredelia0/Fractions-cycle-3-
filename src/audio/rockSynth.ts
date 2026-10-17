/**
 * Kawaii Rock'n'Roll Web Audio Synthesizer
 * Generates drums, bassline, saturated guitar riff, high anime lead melody, and game SFX.
 * Zero external audio files, completely code-synthesized.
 * Respects browser autoplay restrictions (no sound before first user gesture).
 */

class RockSynthEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private distortionCurve: Float32Array<ArrayBuffer> | null = null;
  private intervalId: number | null = null;
  private step: number = 0;
  private bpm: number = 138;

  constructor() {
    this.distortionCurve = this.createDistortionCurve(45);
  }

  private createDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const k = typeof amount === 'number' ? amount : 50;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.55, this.ctx.currentTime);

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public startMusic() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.step = 0;

    const stepIntervalMs = (60 / this.bpm / 4) * 1000; // 16th notes
    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx || this.isMuted) return;
      this.playSequencerStep(this.step);
      this.step = (this.step + 1) % 64; // 4-bar loop
    }, stepIntervalMs);
  }

  public stopMusic() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Sequencer for drums, bass, distorted guitar and kawaii melody
  private playSequencerStep(step: number) {
    if (!this.ctx || !this.musicGain) return;
    const time = this.ctx.currentTime;
    const beat16 = step % 16;
    const bar = Math.floor(step / 16);

    // 1. Drum Machine
    // Kick on beats 0, 4, 8, 12, with occasional rock syncopation on 10, 14
    if (beat16 === 0 || beat16 === 8 || (bar % 2 === 1 && beat16 === 14)) {
      this.synthesizeKick(time);
    }
    // Snare on beats 4 and 12 (backbeat)
    if (beat16 === 4 || beat16 === 12) {
      this.synthesizeSnare(time);
    }
    // Hi-hat on every 8th note (0, 2, 4, 6, 8, 10, 12, 14) with accent on upbeat
    if (beat16 % 2 === 0) {
      const openHat = beat16 % 4 === 2;
      this.synthesizeHiHat(time, openHat);
    }

    // 2. Bass Line (Rock roots: A -> F -> C -> G)
    const rootNotes = [110, 87.31, 130.81, 98]; // A2, F2, C3, G2
    const currentRoot = rootNotes[bar % rootNotes.length];
    if (beat16 % 2 === 0) {
      const isOctave = beat16 === 6 || beat16 === 14;
      this.synthesizeBass(time, isOctave ? currentRoot * 2 : currentRoot);
    }

    // 3. Saturated Electric Guitar Riff (Distorted Power Chord rhythm)
    if (beat16 === 0 || beat16 === 3 || beat16 === 6 || beat16 === 8 || beat16 === 11 || beat16 === 14) {
      const guitarFreqs: number[][] = [
        [220, 330, 440], // A5
        [174.61, 261.63, 349.23], // F5
        [261.63, 392, 523.25], // C5
        [196, 293.66, 392], // G5
      ];
      this.synthesizeGuitarPowerChord(time, guitarFreqs[bar % 4]);
    }

    // 4. Kawaii High Lead Melody (Anime Pentatonic catchy hook)
    const melodyPattern: (number | null)[] = [
      880, null, 987.77, null, 1046.5, null, 1318.51, null, // A5, B5, C6, E6
      1174.66, null, 1046.5, null, 880, null, null, null, // D6, C6, A5
      1046.5, null, 1318.51, null, 1567.98, null, 1760, null, // C6, E6, G6, A6
      1567.98, null, 1318.51, null, 1046.5, null, 880, null, // G6, E6, C6, A5
    ];
    const melodyNote = melodyPattern[step % melodyPattern.length];
    if (melodyNote) {
      this.synthesizeKawaiiLead(time, melodyNote);
    }
  }

  // --- Drum Synthesizers ---
  private synthesizeKick(time: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.14);

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  private synthesizeSnare(time: number) {
    if (!this.ctx || !this.musicGain) return;
    // Tone pop
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.1);
    oscGain.gain.setValueAtTime(0.5, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.12);

    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.14);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + 0.15);
  }

  private synthesizeHiHat(time: number, isOpen: boolean) {
    if (!this.ctx || !this.musicGain) return;
    const dur = isOpen ? 0.1 : 0.04;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(8000, time);
    filter.Q.setValueAtTime(3, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isOpen ? 0.22 : 0.14, time);
    gain.gain.exponentialRampToValueAtTime(0.005, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + dur);
  }

  // --- Bass Synthesizer ---
  private synthesizeBass(time: number, freq: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(150, time + 0.15);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  // --- Saturated Rock Guitar Power Chord ---
  private synthesizeGuitarPowerChord(time: number, freqs: number[]) {
    if (!this.ctx || !this.musicGain || !this.distortionCurve) return;

    const chordGain = this.ctx.createGain();
    const waveshaper = this.ctx.createWaveShaper();
    waveshaper.curve = this.distortionCurve;
    waveshaper.oversample = '2x';

    const cabinetFilter = this.ctx.createBiquadFilter();
    cabinetFilter.type = 'bandpass';
    cabinetFilter.frequency.setValueAtTime(1400, time);
    cabinetFilter.Q.setValueAtTime(1.8, time);

    freqs.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      osc.connect(waveshaper);
      osc.start(time);
      osc.stop(time + 0.16);
    });

    waveshaper.connect(cabinetFilter);
    cabinetFilter.connect(chordGain);

    chordGain.gain.setValueAtTime(0.18, time);
    chordGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    chordGain.connect(this.musicGain);
  }

  // --- Kawaii High Lead Melody ---
  private synthesizeKawaiiLead(time: number, freq: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    // Gentle vibrato
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.linearRampToValueAtTime(freq * 1.01, time + 0.08);
    osc.frequency.linearRampToValueAtTime(freq, time + 0.15);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.005, time + 0.16);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  // --- Sound Effects ---
  public playHit(type: 'perfect' | 'good' | 'miss') {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const time = this.ctx.currentTime;

    if (type === 'perfect') {
      // Arpeggio chime of three notes (C6 - E6 - G6)
      [1046.5, 1318.51, 1567.98].forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time + idx * 0.04);
        gain.gain.setValueAtTime(0.25, time + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.04 + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(time + idx * 0.04);
        osc.stop(time + idx * 0.04 + 0.28);
      });
    } else if (type === 'good') {
      // Gentle dual chime
      [880, 1046.5].forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time + idx * 0.05);
        gain.gain.setValueAtTime(0.2, time + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(time + idx * 0.05);
        osc.stop(time + idx * 0.05 + 0.22);
      });
    } else {
      // Friendly, non-punishing soft blip (Never harsh buzzer)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, time);
      osc.frequency.exponentialRampToValueAtTime(180, time + 0.12);
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.005, time + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time);
      osc.stop(time + 0.16);
    }
  }

  public playFreeze() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, time);
    osc.frequency.exponentialRampToValueAtTime(440, time + 0.25);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(time);
    osc.stop(time + 0.32);
  }

  public playCoin() {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const time = this.ctx.currentTime;
    [987.77, 1318.51].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time + idx * 0.06);
      gain.gain.setValueAtTime(0.2, time + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.06 + 0.15);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time + idx * 0.06);
      osc.stop(time + idx * 0.06 + 0.18);
    });
  }

  public playBoosterReveal(rarity: string) {
    this.init();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const time = this.ctx.currentTime;
    const notes =
      rarity === 'legendaire'
        ? [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093]
        : rarity === 'epique'
        ? [523.25, 659.25, 783.99, 1046.5, 1318.51]
        : [523.25, 659.25, 783.99];

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time + idx * 0.07);
      gain.gain.setValueAtTime(0.3, time + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, time + idx * 0.07 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(time + idx * 0.07);
      osc.stop(time + idx * 0.07 + 0.4);
    });
  }
}

export const rockSynth = new RockSynthEngine();
