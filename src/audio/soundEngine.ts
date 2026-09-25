/**
 * Procedural Web Audio Engine for Blockverse: Neon Blast
 * Synthesizes all SFX and ambient neon music in real time without external assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGainNode: GainNode | null = null;
  private musicGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicIntervalId: number | null = null;
  private musicStep: number = 0;

  public sfxVolume: number = 0.8;
  public musicVolume: number = 0.5;
  public sfxEnabled: boolean = true;
  public musicEnabled: boolean = true;
  public hapticsEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized upon user gesture
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGainNode.connect(this.ctx.destination);

      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.setValueAtTime(this.sfxEnabled ? this.sfxVolume : 0, this.ctx.currentTime);
      this.sfxGainNode.connect(this.masterGainNode);

      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(this.musicEnabled ? this.musicVolume : 0, this.ctx.currentTime);
      this.musicGainNode.connect(this.masterGainNode);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateSettings(sfxVol: number, musVol: number, sfxOn: boolean, musOn: boolean, hapticsOn: boolean) {
    this.sfxVolume = sfxVol;
    this.musicVolume = musVol;
    this.sfxEnabled = sfxOn;
    this.musicEnabled = musOn;
    this.hapticsEnabled = hapticsOn;

    if (this.sfxGainNode && this.ctx) {
      this.sfxGainNode.gain.setValueAtTime(sfxOn ? sfxVol : 0, this.ctx.currentTime);
    }
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(musOn ? musVol : 0, this.ctx.currentTime);
    }

    if (musOn && !this.isMusicPlaying) {
      this.startMusic();
    } else if (!musOn && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  public triggerHaptic(pattern: number | number[] = 15) {
    if (this.hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Safe catch for browsers with strict permissions
      }
    }
  }

  // --- SFX METHODS ---

  public playClick() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.04);

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  public playPickup() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.06);

    gain.gain.setValueAtTime(0.15 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.08);
    this.triggerHaptic(8);
  }

  public playRotate() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(750, t + 0.07);

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.09);
    this.triggerHaptic(10);
  }

  public playSnap() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;

    // Bass punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.09);
    gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.1);

    // High snap click
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(800, t);
    osc2.frequency.exponentialRampToValueAtTime(300, t + 0.04);
    gain2.gain.setValueAtTime(0.15 * this.sfxVolume, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc2.connect(gain2);
    gain2.connect(this.sfxGainNode);
    osc2.start(t);
    osc2.stop(t + 0.05);

    this.triggerHaptic(12);
  }

  public playInvalid() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.setValueAtTime(110, t + 0.06);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.15);
    this.triggerHaptic([20, 30, 20]);
  }

  public playLineClear(linesCount: number, comboCount: number) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    // Scale scale base tone with combo
    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const baseIndex = Math.min(pentatonic.length - 4, (comboCount - 1) * 2);
    const notesToPlay = Math.min(5, 2 + linesCount);

    for (let i = 0; i < notesToPlay; i++) {
      const freq = pentatonic[(baseIndex + i) % pentatonic.length] * (comboCount > 3 ? 1.25 : 1);
      const noteDelay = i * 0.05;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = comboCount > 2 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, t + noteDelay);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t + noteDelay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDelay + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(t + noteDelay);
      osc.stop(t + noteDelay + 0.3);
    }

    this.triggerHaptic(linesCount > 1 ? [30, 40, 50] : 25);
  }

  public playBomb() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;

    // Sub-rumble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(t);
    osc.stop(t + 0.5);

    // Noise burst simulation
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 0.3);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4 * this.sfxVolume, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGainNode);

    noise.start(t);
    this.triggerHaptic([40, 30, 60]);
  }

  public playLightning() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.25);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.3);
    this.triggerHaptic([30, 20, 40]);
  }

  public playHammer() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);

    gain.gain.setValueAtTime(0.4 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + 0.18);
    this.triggerHaptic(30);
  }

  public playPerfectClear() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    // Celebratory triumphant fanfare: C4 - E4 - G4 - B4 - C5 - E5
    const notes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25];
    notes.forEach((freq, idx) => {
      const delay = idx * 0.1;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + delay);

      gain.gain.setValueAtTime(0.35 * this.sfxVolume, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(t + delay);
      osc.stop(t + delay + 0.55);
    });

    this.triggerHaptic([50, 40, 50, 40, 80]);
  }

  public playLevelUp() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    notes.forEach((freq, idx) => {
      const delay = idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(t + delay);
      osc.stop(t + delay + 0.45);
    });

    this.triggerHaptic([30, 40, 60]);
  }

  public playAchievement() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const delay = idx * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(t + delay);
      osc.stop(t + delay + 0.45);
    });

    this.triggerHaptic([20, 30, 50]);
  }

  public playGameOver() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || !this.sfxGainNode) return;

    const t = this.ctx.currentTime;
    const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
    notes.forEach((freq, idx) => {
      const delay = idx * 0.18;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(t + delay);
      osc.stop(t + delay + 0.45);
    });

    this.triggerHaptic([60, 50, 100]);
  }

  // --- AMBIENT NEON SYNTH MUSIC LOOP ---

  public startMusic() {
    if (!this.musicEnabled || this.isMusicPlaying) return;
    this.init();
    if (!this.ctx || !this.musicGainNode) return;

    this.isMusicPlaying = true;
    this.musicStep = 0;

    // Ambient cyberpunk chord progression in C minor: Cm9 -> Abmaj7 -> Fm9 -> Gsus4
    const chords = [
      [130.81, 196.00, 233.08, 311.13, 392.00], // C3, G3, Bb3, Eb4, G4
      [103.83, 155.56, 207.65, 261.63, 311.13], // Ab2, Eb3, Ab3, C4, Eb4
      [87.31, 130.81, 174.61, 207.65, 261.63],  // F2, C3, F3, Ab3, C4
      [98.00, 146.83, 196.00, 261.63, 293.66],  // G2, D3, G3, C4, D4
    ];

    const stepDuration = 320; // ms per 16th arpeggio pulse

    this.musicIntervalId = window.setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGainNode) return;

      const chordIdx = Math.floor(this.musicStep / 8) % chords.length;
      const chord = chords[chordIdx];
      const noteIdx = this.musicStep % chord.length;
      const freq = chord[noteIdx];

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + Math.sin(this.musicStep * 0.2) * 400, t);

      gain.gain.setValueAtTime(0.045 * this.musicVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGainNode);

      osc.start(t);
      osc.stop(t + 0.3);

      this.musicStep++;
    }, stepDuration);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }
}

export const sound = new SoundEngine();
