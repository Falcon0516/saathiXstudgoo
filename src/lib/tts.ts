/**
 * Client-side TTS helper — Sarvam AI with browser speech fallback.
 *
 * Key design decisions:
 *  - `speakWithSarvam()` returns a Promise<HTMLAudioElement | null>
 *  - `speakAndWait()` resolves only AFTER playback ends (or error/timeout)
 *  - All callers in simulations should use `speakAndWait()` to sync
 *    stage progression with actual audio duration.
 */

export interface TTSOptions {
  text: string;
  language_code?: string;
  speaker?: string;
  pace?: number;
}

let currentAudio: HTMLAudioElement | null = null;
const HARD_TIMEOUT_MS = 10_000; // fail-open after 10s if TTS hangs

/**
 * Play TTS audio and return immediately with the audio element.
 * Use `speakAndWait()` if you need to wait for playback to finish.
 */
export async function speakWithSarvam(options: TTSOptions): Promise<HTMLAudioElement | null> {
  let { text, language_code = "en-IN", speaker = "shubh", pace = 1.0 } = options;

  // Pre-process text for better TTS pronunciation
  // Sarvam's engine spells out hyphenated words and abbreviations letter-by-letter.
  // This pipeline converts them to speech-friendly forms.
  text = text
    // Expand common abbreviations BEFORE removing hyphens
    .replace(/\btier[-\s]?1\b/gi, "tier one")
    .replace(/\btier[-\s]?2\b/gi, "tier two")
    .replace(/\btier[-\s]?3\b/gi, "tier three")
    .replace(/\b24\/7\b/g, "twenty four seven")
    .replace(/\bkm\b/gi, "kilometers")
    .replace(/\b(\d+)-kilometer\b/gi, "$1 kilometer")
    .replace(/\b(\d+)-hour\b/gi, "$1 hour")
    .replace(/\bgeo[-\s]?fence\b/gi, "geo fence")
    .replace(/\bAM\b/g, "A M")
    .replace(/\bPM\b/g, "P M")
    .replace(/\bGPS\b/g, "G P S")
    .replace(/\bAI\b/g, "A I")
    // Replace remaining hyphens between words with spaces (avoids letter-by-letter)
    .replace(/(\w)-(\w)/g, "$1 $2");

  try {
    stopSarvamAudio();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HARD_TIMEOUT_MS);

    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language_code, speaker, pace, model: "bulbul:v3" }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn("TTS API failed, falling back to browser speech");
      return fallbackSpeak(text);
    }

    const data = await response.json();
    const audioBase64 = data.audios?.[0] || data.audio;
    if (!audioBase64) {
      console.warn("No audio in TTS response, falling back");
      return fallbackSpeak(text);
    }

    const audioBlob = base64ToBlob(audioBase64, "audio/wav");
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    await audio.play();
    return audio;
  } catch (err) {
    console.warn("TTS error, falling back:", err);
    return fallbackSpeak(text);
  }
}

/**
 * Play TTS and wait until playback finishes (or error/timeout).
 * This is the primary API for simulation autoplay sync.
 */
export async function speakAndWait(options: TTSOptions): Promise<number> {
  const audio = await speakWithSarvam(options);
  if (!audio) {
    /* Fallback was browser speech or complete failure.
       Estimate duration: ~150ms per word. */
    const wordCount = options.text.split(/\s+/).length;
    const estimatedMs = Math.max(2000, wordCount * 150);
    await delay(estimatedMs);
    return estimatedMs;
  }

  const duration = await waitForAudioEnd(audio);
  return duration;
}

/**
 * Wait for an audio element to finish playing.
 * Resolves with actual duration in ms. Has a hard timeout fallback.
 */
function waitForAudioEnd(audio: HTMLAudioElement): Promise<number> {
  return new Promise<number>((resolve) => {
    const hardTimeout = setTimeout(() => {
      resolve((audio.duration || 5) * 1000);
    }, HARD_TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(hardTimeout);
      resolve((audio.duration || 5) * 1000);
    };

    audio.addEventListener("ended", cleanup, { once: true });
    audio.addEventListener("error", cleanup, { once: true });
  });
}

/**
 * Get estimated speech duration without playing.
 * Used when audioEnabled is false but we still need sane pacing.
 */
export function estimateSpeechDuration(text: string): number {
  const wordCount = text.split(/\s+/).length;
  return Math.max(2000, wordCount * 150);
}

export function stopSarvamAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Fallback to browser speech synthesis.
 * Returns a pseudo HTMLAudioElement-like object (actually null)
 * so callers can still chain. Duration is estimated via word count.
 */
function fallbackSpeak(text: string): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 1.0;
  utter.pitch = 1.05;
  utter.lang = "en-IN";
  window.speechSynthesis.speak(utter);
  return null; // callers fall back to estimated timing
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }
  return new Blob([arr], { type: mimeType });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ══════════════════════════════════════════════
   Voice Profiles — using AURORA palette tokens
   ══════════════════════════════════════════════ */
export const VOICE_PROFILES = {
  sim1: {
    name: "Aditya",
    speaker: "aditya",
    gender: "Male" as const,
    language: "English (Indian)",
    languageCode: "en-IN",
    description: "Professional, warm male voice for candidate outreach calls",
    avatar: "A",
    color: "#2997FF",
  },
  sim2: {
    name: "Priya",
    speaker: "priya",
    gender: "Female" as const,
    language: "English (Indian)",
    languageCode: "en-IN",
    description: "Clear, trustworthy female voice for masked call routing",
    avatar: "P",
    color: "#BF48FF",
  },
  sim3: {
    name: "Kavya",
    speaker: "kavya",
    gender: "Female" as const,
    language: "English (Indian)",
    languageCode: "en-IN",
    description: "Friendly, empathetic voice for 24/7 customer support",
    avatar: "K",
    color: "#30D158",
  },
  hindi: {
    name: "Rohan",
    speaker: "rohan",
    gender: "Male" as const,
    language: "Hindi",
    languageCode: "hi-IN",
    description: "Natural Hindi voice for vernacular support",
    avatar: "R",
    color: "#FF9F0A",
  },
  kannada: {
    name: "Kavitha",
    speaker: "kavitha",
    gender: "Female" as const,
    language: "Kannada",
    languageCode: "kn-IN",
    description: "Native Kannada voice for Bangalore-local outreach",
    avatar: "Ka",
    color: "#FF26B9",
  },
  narrator: {
    name: "Saathi Narrator",
    speaker: "shubh",
    gender: "Male" as const,
    language: "English (Indian)",
    languageCode: "en-IN",
    description: "System explainer voice guiding the user through simulations",
    avatar: "S",
    color: "#FF26B9",
  },
};
