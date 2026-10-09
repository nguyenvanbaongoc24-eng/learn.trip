// Audio & Text-to-Speech (TTS) manager for Mentor in Learn.Trip

class MentorAudioManager {
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private viVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.initVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoices();
      };
    }
  }

  private initVoices() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prefer Vietnamese voices
    const vietnameseVoice =
      voices.find((v) => v.lang.startsWith("vi")) ||
      voices.find((v) => v.lang.includes("VN")) ||
      null;
    this.viVoice = vietnameseVoice;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Speak text in Vietnamese or English using Web Speech API
   */
  public speak(
    text: string,
    options: {
      lang?: "vi-VN" | "en-US";
      rate?: number;
      pitch?: number;
      onEnd?: () => void;
      onError?: () => void;
    } = {}
  ): boolean {
    if (this.isMuted) return false;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

    try {
      this.stop();

      const lang = options.lang || "vi-VN";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = options.rate || 0.95; // Slightly slower for kids
      utterance.pitch = options.pitch || 1.1; // Friendly slightly higher pitch for mascot

      if (lang === "vi-VN" && this.viVoice) {
        utterance.voice = this.viVoice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        options.onEnd?.();
      };

      utterance.onerror = () => {
        this.currentUtterance = null;
        options.onError?.();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  }

  public stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.currentUtterance = null;
  }
}

export const mentorAudio = new MentorAudioManager();
