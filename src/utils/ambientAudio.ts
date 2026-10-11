/**
 * Procedural Web Audio Ambient Soundscapes for Learn.Trip destinations
 * Zero external audio downloads, 100% lightweight, zero 404s.
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private currentDest: string = '';
  private masterGain: GainNode | null = null;
  private intervalTimer: any = null;
  private activeNodes: (AudioNode | { stop?: () => void })[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.18, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Pink noise generator for soothing wind/waves
  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  start(destinationId: string = 'loc-hanoi') {
    if (typeof window === 'undefined') return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stop();
    this.currentDest = destinationId;
    this.isPlaying = true;

    const noiseBuffer = this.createNoiseBuffer();
    if (!noiseBuffer) return;

    const destKey = destinationId.replace('loc-', '');

    if (destKey === 'halong') {
      // ── HA LONG: Rolling Ocean Waves ──
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const waveFilter = this.ctx.createBiquadFilter();
      waveFilter.type = 'lowpass';
      waveFilter.frequency.setValueAtTime(260, this.ctx.currentTime);

      const waveLfo = this.ctx.createOscillator();
      waveLfo.type = 'sine';
      waveLfo.frequency.setValueAtTime(0.14, this.ctx.currentTime); // Wave period ~7s

      const waveLfoGain = this.ctx.createGain();
      waveLfoGain.gain.setValueAtTime(220, this.ctx.currentTime);
      waveLfo.connect(waveLfoGain);
      waveLfoGain.connect(waveFilter.frequency);

      const seaGain = this.ctx.createGain();
      seaGain.gain.setValueAtTime(0.28, this.ctx.currentTime);

      noiseSource.connect(waveFilter);
      waveFilter.connect(seaGain);
      seaGain.connect(this.masterGain);

      noiseSource.start();
      waveLfo.start();
      this.activeNodes.push(noiseSource, waveLfo);

    } else if (destKey === 'sapa') {
      // ── SAPA: Mountain Breeze & High Wind ──
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
      windFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      const windLfo = this.ctx.createOscillator();
      windLfo.type = 'sine';
      windLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // ~12s gusts

      const windLfoGain = this.ctx.createGain();
      windLfoGain.gain.setValueAtTime(200, this.ctx.currentTime);
      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);

      const sapaGain = this.ctx.createGain();
      sapaGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      noiseSource.connect(windFilter);
      windFilter.connect(sapaGain);
      sapaGain.connect(this.masterGain);

      noiseSource.start();
      windLfo.start();
      this.activeNodes.push(noiseSource, windLfo);

      // Periodic gentle mountain wind chime (E-minor pentatonic: 659Hz, 783Hz, 987Hz)
      const chimeNotes = [659.25, 783.99, 987.77, 1174.66];
      this.intervalTimer = setInterval(() => {
        if (!this.isPlaying || this.isMuted || !this.ctx || !this.masterGain) return;
        const note = chimeNotes[Math.floor(Math.random() * chimeNotes.length)];
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, this.ctx.currentTime);
        g.gain.setValueAtTime(0.03, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.2);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 3.2);
      }, 5500);

    } else if (destKey === 'hoian') {
      // ── HOI AN: River Ripple & Bamboo Wind Chime ──
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const riverFilter = this.ctx.createBiquadFilter();
      riverFilter.type = 'lowpass';
      riverFilter.frequency.setValueAtTime(340, this.ctx.currentTime);

      const hoianGain = this.ctx.createGain();
      hoianGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      noiseSource.connect(riverFilter);
      riverFilter.connect(hoianGain);
      hoianGain.connect(this.masterGain);

      noiseSource.start();
      this.activeNodes.push(noiseSource);

      // Soft water droplet / lantern wooden strike
      const riverNotes = [440, 523.25, 659.25, 783.99];
      this.intervalTimer = setInterval(() => {
        if (!this.isPlaying || this.isMuted || !this.ctx || !this.masterGain) return;
        const note = riverNotes[Math.floor(Math.random() * riverNotes.length)];
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, this.ctx.currentTime);
        g.gain.setValueAtTime(0.04, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.8);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 1.8);
      }, 4200);

    } else {
      // ── HANOI: Gentle City Breeze & Distant Temple Bell ──
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const breezeFilter = this.ctx.createBiquadFilter();
      breezeFilter.type = 'lowpass';
      breezeFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

      const hanoiGain = this.ctx.createGain();
      hanoiGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      noiseSource.connect(breezeFilter);
      breezeFilter.connect(hanoiGain);
      hanoiGain.connect(this.masterGain);

      noiseSource.start();
      this.activeNodes.push(noiseSource);

      // Distant bell resonance
      this.intervalTimer = setInterval(() => {
        if (!this.isPlaying || this.isMuted || !this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, this.ctx.currentTime); // Solfeggio 528Hz peaceful bell
        g.gain.setValueAtTime(0.035, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.8);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 3.8);
      }, 6200);
    }
  }

  stop() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    for (const node of this.activeNodes) {
      try {
        if (typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        if (typeof (node as any).disconnect === 'function') {
          (node as any).disconnect();
        }
      } catch (_) {}
    }
    this.activeNodes = [];
    this.isPlaying = false;
  }

  toggle(): boolean {
    if (this.isPlaying) {
      if (this.isMuted) {
        this.setMuted(false);
      } else {
        this.setMuted(true);
      }
      return !this.isMuted;
    } else {
      this.setMuted(false);
      this.start(this.currentDest || 'loc-hanoi');
      return true;
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.18, this.ctx.currentTime);
    }
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ambientSound = new AmbientSoundEngine();
