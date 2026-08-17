// Celyn V1.0 — Web Speech API wrapper (STT + TTS)
// Hands-free "Alexa mode": tap the mic once, speak, Celyn replies out loud.

const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;

export const speechSupported = {
  stt: !!SpeechRecognitionImpl,
  tts: "speechSynthesis" in window,
};

export class VoiceEngine {
  constructor({ onResult, onListeningChange, onError } = {}) {
    this.onResult = onResult || (() => {});
    this.onListeningChange = onListeningChange || (() => {});
    this.onError = onError || (() => {});
    this.recognition = null;
    this.listening = false;
    this.voice = null;

    if (speechSupported.stt) {
      this.recognition = new SpeechRecognitionImpl();
      this.recognition.lang = "en-US";
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
      this.recognition.continuous = false;

      this.recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join(" ")
          .trim();
        if (transcript) this.onResult(transcript);
      };

      this.recognition.onend = () => {
        this.listening = false;
        this.onListeningChange(false);
      };

      this.recognition.onerror = (event) => {
        this.listening = false;
        this.onListeningChange(false);
        this.onError(event.error || "speech-recognition-error");
      };
    }

    if (speechSupported.tts) {
      const pickVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        this.voice =
          voices.find((v) => v.lang === "en-US" && /female|samantha|zira|jenny/i.test(v.name)) ||
          voices.find((v) => v.lang === "en-US") ||
          voices.find((v) => v.lang?.startsWith("en")) ||
          voices[0] ||
          null;
      };
      pickVoice();
      window.speechSynthesis.onvoiceschanged = pickVoice;
    }
  }

  start() {
    if (!this.recognition || this.listening) return;
    try {
      this.recognition.start();
      this.listening = true;
      this.onListeningChange(true);
    } catch {
      // recognition already started; ignore
    }
  }

  stop() {
    if (!this.recognition || !this.listening) return;
    this.recognition.stop();
  }

  speak(text, { onEnd } = {}) {
    if (!speechSupported.tts || !text) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.98;
    utterance.pitch = 1.0;
    if (this.voice) utterance.voice = this.voice;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
  }

  cancelSpeak() {
    if (speechSupported.tts) window.speechSynthesis.cancel();
  }
}
