"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Square, Volume2, Mic, Globe } from "lucide-react";
import { speakWithSarvam, stopSarvamAudio, VOICE_PROFILES } from "@/lib/tts";

const voiceList = Object.entries(VOICE_PROFILES).filter(([key]) => key !== "narrator");

const sampleTexts: Record<string, string> = {
  "en-IN": "Hi, this is Saathi calling from StudGoo. We have a verified shift available near you tomorrow morning. Are you available?",
  "hi-IN": "नमस्ते, यह साथी है स्टडगू से। आपके पास कल सुबह के लिए एक शिफ्ट उपलब्ध है। क्या आप उपलब्ध हैं?",
  "kn-IN": "ನಮಸ್ಕಾರ, ಇದು ಸ್ಟಡ್‌ಗೂ ನಿಂದ ಸಾಥಿ. ನಾಳೆ ಬೆಳಿಗ್ಗೆ ನಿಮ್ಮ ಬಳಿ ಒಂದು ಶಿಫ್ಟ್ ಲಭ್ಯವಿದೆ. ನೀವು ಲಭ್ಯವಿದ್ದೀರಾ?",
};

export default function VoiceShowcase() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const handlePlay = async (key: string) => {
    const profile = VOICE_PROFILES[key as keyof typeof VOICE_PROFILES];
    if (playing === key) {
      stopSarvamAudio();
      setPlaying(null);
      return;
    }

    stopSarvamAudio();
    setPlaying(null);
    setLoading(key);

    const sampleText = sampleTexts[profile.languageCode] || sampleTexts["en-IN"];

    const audio = await speakWithSarvam({
      text: sampleText,
      language_code: profile.languageCode,
      speaker: profile.speaker,
      pace: 1.0,
    });

    setLoading(null);
    setPlaying(key);

    if (audio) {
      audio.onended = () => setPlaying(null);
    } else {
      setTimeout(() => setPlaying(null), 5000);
    }
  };

  return (
    <section style={{
      position: "relative", padding: "120px 0", overflow: "hidden",
      background: "var(--bg)",
    }}>
      <div className="float-zero-g" style={{
        position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: "50vw", height: "30vw", borderRadius: "50%",
        background: "radial-gradient(ellipse at top center, rgba(41,151,255,0.06), transparent 60%)",
        filter: "blur(80px)",
      }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, type: "spring", damping: 20, stiffness: 100 }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2997FF", display: "block", marginBottom: 16 }}>
            Voice Engine
          </span>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text-primary)", marginBottom: 20, lineHeight: 1.1 }}>
            Multilingual <span className="aurora-text-gradient">Voice Profiles</span>
          </h2>
          <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
            Saathi&apos;s Proprietary Conversational AI speaks naturally in English, Hindi, and Kannada — each voice tuned for a specific operational role.
          </p>
        </motion.div>

        {/* Voice Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {voiceList.map(([key, profile], i) => {
            const isPlaying = playing === key;
            const isLoading = loading === key;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, type: "spring", damping: 20, stiffness: 100 }}
                className={isPlaying ? "" : "glass"}
                style={{
                  padding: 32, borderRadius: 28, position: "relative",
                  background: isPlaying
                    ? `linear-gradient(145deg, ${profile.color}15, var(--surface))`
                    : undefined,
                  border: isPlaying
                    ? `1px solid ${profile.color}40`
                    : undefined,
                  backdropFilter: isPlaying ? "blur(40px) saturate(180%)" : undefined,
                  boxShadow: isPlaying
                    ? `0 0 40px ${profile.color}20, 0 8px 32px var(--glass-shadow)`
                    : undefined,
                  transition: "all 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
                  {/* Avatar */}
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                    background: `${profile.color}15`,
                    border: `1px solid ${profile.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 800, color: profile.color,
                  }}>
                    {profile.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4, letterSpacing: "-0.01em" }}>
                      {profile.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
                        background: profile.gender === "Male" ? "rgba(41,151,255,0.12)" : "rgba(191,72,255,0.12)",
                        color: profile.gender === "Male" ? "#2997FF" : "#BF48FF",
                      }}>
                        {profile.gender}
                      </span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
                        background: "rgba(255,159,10,0.12)", color: "#FF9F0A",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        <Globe style={{ width: 12, height: 12 }} />
                        {profile.language}
                      </span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
                  {profile.description}
                </p>

                {/* Waveform visualization when playing */}
                {isPlaying && (
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    height: 32, marginBottom: 16, gap: 2,
                  }}>
                    {Array.from({ length: 16 }).map((_, j) => (
                      <span key={j} className="waveform-bar" style={{ background: profile.color }} />
                    ))}
                  </div>
                )}

                {/* Play Button */}
                <button
                  onClick={() => handlePlay(key)}
                  disabled={isLoading}
                  style={{
                    width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
                    background: isPlaying ? `${profile.color}25` : `${profile.color}15`,
                    color: profile.color, fontSize: 14, fontWeight: 700,
                    cursor: isLoading ? "wait" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <div style={{
                        width: 14, height: 14, border: `2px solid ${profile.color}40`,
                        borderTopColor: profile.color, borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                      }} />
                      Generating...
                    </>
                  ) : isPlaying ? (
                    <>
                      <Square style={{ width: 14, height: 14 }} />
                      Stop Preview
                    </>
                  ) : (
                    <>
                      <Play style={{ width: 14, height: 14 }} />
                      Preview Voice
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, type: "spring", damping: 20, stiffness: 100 }}
          className="glass"
          style={{
            textAlign: "center", padding: "16px 24px",
            display: "inline-flex", alignItems: "center", gap: 10,
            margin: "48px auto 0", width: "fit-content",
            position: "relative", left: "50%", transform: "translateX(-50%)"
          }}
        >
          <Mic style={{ width: 16, height: 16, color: "#30D158" }} />
          <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
            30+ voice personas available across 11 Indian languages — tunable for pace, tone, and regional accent.
          </span>
        </motion.div>
      </div>
    </section>
  );
}
