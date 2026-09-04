"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, Volume2, VolumeX, Eye, EyeOff,
  MapPin, CreditCard, HelpCircle, CheckCircle2,
  Clock, Headphones, Search, Mic, MicOff,
} from "lucide-react";
import { speakWithSarvam, speakAndWait, stopSarvamAudio, estimateSpeechDuration, VOICE_PROFILES } from "@/lib/tts";
import NarratorCaption from "@/components/NarratorCaption";

type ActivePill = null | "A" | "B" | "C";
type Phase = "idle" | "ingesting" | "retrieving" | "speaking" | "resolved" | "summary";

const pills = {
  A: {
    icon: MapPin, label: "Merchant Issue",
    query: "My event helper hasn't arrived yet.",
    color: "#2997FF",
    retrievalSteps: ["Querying Live GPS Coordinates...", "Target: Rohit (Event Helper)", "Status: 600m away, ETA 9:08 AM"],
    response: "Hi Star Events, our system logs show Rohit is currently 600 meters away with an estimated arrival of 9:08 AM. Would you like me to ping his relay number?",
  },
  B: {
    icon: CreditCard, label: "Student Query",
    query: "When will my Friday cafe payout be credited?",
    color: "#0EA5E9",
    retrievalSteps: ["Querying Payout Ledger...", "Batch: Bank Clearing Batch #883", "Status: Processing — ETA Today 4:00 PM"],
    response: "Hi Priya, your Friday payout of ₹2,400 from Third Wave Roasters is currently in Bank Clearing Batch 883. It will be credited to your account by 4 PM today.",
  },
  C: {
    icon: HelpCircle, label: "General FAQ",
    query: "What are the verification requirements?",
    color: "#6366F1",
    retrievalSteps: ["Querying Verification Policy...", "Loading: Student Onboarding Requirements", "Result: 3-step verification process"],
    response: "To get verified on StudGoo, you need three things: a valid college ID, an Aadhaar-linked phone number for identity verification, and a completed skills assessment. The whole process takes under 10 minutes.",
  },
};

const narratorLines = {
  intro: "This is the support layer — Saathi handles all tier-1 queries autonomously by pulling live operational data. No call center, no ticket queue. Pick a scenario to see it in action.",
  summary: "That query was resolved in under two seconds, with zero human involvement. Saathi handles 85 percent of support volume this way — GPS lookups, payout status, policy questions — all resolved instantly.",
};

const spring = { type: "spring" as const, damping: 25, stiffness: 200 };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Simulation3() {
  const [activePill, setActivePill] = useState<ActivePill>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [narratorEnabled, setNarratorEnabled] = useState(true);
  const [showContext, setShowContext] = useState(true);
  const [retrievalStep, setRetrievalStep] = useState(0);
  const [transcript, setTranscript] = useState("");
  
  const [narratorText, setNarratorText] = useState("");
  const [narratorPlaying, setNarratorPlaying] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);
  
  const abortRef = useRef(false);

  const streamText = useCallback((text: string, durationMs: number) => {
    setTranscript("");
    let i = 0;
    const intervalMs = Math.max(20, Math.min(60, durationMs / text.length));
    
    const id = setInterval(() => {
      if (abortRef.current) {
        clearInterval(id);
        return;
      }
      if (i < text.length) {
        setTranscript(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(id);
      }
    }, intervalMs);
  }, []);

  const playNarrator = async (text: string) => {
    if (abortRef.current) return;
    
    setNarratorText(text);
    const est = estimateSpeechDuration(text);
    
    if (!narratorEnabled || !audioEnabled) {
      await delay(est);
      if (!abortRef.current) setNarratorText("");
      return;
    }
    
    setNarratorPlaying(true);
    await speakAndWait({
      text,
      speaker: VOICE_PROFILES.narrator.speaker,
      pace: 1.05
    });
    
    if (!abortRef.current) {
      setNarratorPlaying(false);
      setNarratorText("");
    }
  };

  const handlePillClick = async (pill: "A" | "B" | "C") => {
    if (phase !== "idle") return;
    abortRef.current = false;
    setActivePill(pill);

    // Play intro narrator on first interaction
    if (!introPlayed) {
      setIntroPlayed(true);
      await playNarrator(narratorLines.intro);
      if (abortRef.current) return;
    }

    setPhase("ingesting");
    setRetrievalStep(0);
    setTranscript("");

    await delay(1000);
    if (abortRef.current) return;

    setPhase("retrieving");
    const steps = pills[pill].retrievalSteps;
    
    for (let idx = 0; idx < steps.length; idx++) {
      await delay(700);
      if (abortRef.current) return;
      setRetrievalStep(idx + 1);
    }

    await delay(500);
    if (abortRef.current) return;

    setPhase("speaking");
    
    let duration = estimateSpeechDuration(pills[pill].response);
    let audioEndPromise = Promise.resolve();

    if (audioEnabled) {
      stopSarvamAudio();
      const audio = await speakWithSarvam({
        text: pills[pill].response,
        language_code: VOICE_PROFILES.sim3.languageCode,
        speaker: VOICE_PROFILES.sim3.speaker,
        pace: 1.05,
      });
      if (audio) {
        duration = (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) 
          ? audio.duration * 1000 
          : duration;
        
        audioEndPromise = new Promise(resolve => {
          const timeoutId = setTimeout(resolve, duration + 2000);
          const onEnd = () => { clearTimeout(timeoutId); resolve(undefined); };
          audio.addEventListener("ended", onEnd, { once: true });
          audio.addEventListener("error", onEnd, { once: true });
        });
      }
    }

    streamText(pills[pill].response, duration);
    
    if (audioEnabled) {
      await audioEndPromise;
    } else {
      await delay(duration);
    }
    
    if (abortRef.current) return;

    await delay(400);
    if (abortRef.current) return;

    setPhase("resolved");
    await delay(1500);
    if (abortRef.current) return;

    // Summary narrator
    setPhase("summary");
    await playNarrator(narratorLines.summary);
  };

  const handleReset = () => {
    abortRef.current = true;
    stopSarvamAudio();
    setActivePill(null);
    setPhase("idle");
    setRetrievalStep(0);
    setTranscript("");
    setNarratorText("");
    setNarratorPlaying(false);
  };

  const currentPill = activePill ? pills[activePill] : null;
  const orbColor = phase === "idle" ? "#2997FF" : phase === "ingesting" || phase === "retrieving" ? "#6366F1" : "#0EA5E9";
  const phases = ["Idle", "Ingesting", "Retrieving", "Speaking", "Resolved", "Summary"];
  const phaseMap: Record<string, Phase> = { Idle: "idle", Ingesting: "ingesting", Retrieving: "retrieving", Speaking: "speaking", Resolved: "resolved", Summary: "summary" };

  return (
    <div className="glass-card" style={{
      background: "var(--surface)", borderRadius: 28, padding: 0, position: "relative", overflow: "hidden", border: "1px solid var(--border)",
    }}>
      {/* Ambient */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${orbColor}08, transparent 60%)`, pointerEvents: "none", transition: "background 0.5s" }} />

      {/* Header */}
      <div style={{ padding: "32px 36px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0EA5E9" }} className="glow-pulse-blue" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#0EA5E9" }}>Simulation 3</span>
          </div>
          <h3 style={{ fontSize: 26, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 6 }}>24/7 Voice AI Support</h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 420 }}>Click a scenario to watch Saathi resolve it with live context retrieval.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 12, background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.15)" }}>
          <Headphones style={{ width: 13, height: 13, color: "#0EA5E9" }} />
          <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>Cognitive Engine</span>
        </div>
      </div>

      {/* Main */}
      <div style={{ padding: "48px 36px 32px", minHeight: 480, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36, position: "relative" }}>
        {/* Narrator Overlay */}
        <NarratorCaption 
          text={narratorText} 
          isPlaying={narratorPlaying} 
          visible={!!narratorText} 
          accentColor="#F43F5E"
        />

        {/* Cognitive Orb */}
        <div style={{ position: "relative" }} className="float-zero-g">
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            style={{ position: "absolute", inset: -32, borderRadius: "50%", background: `radial-gradient(circle, ${orbColor}18, transparent 70%)` }}
          />
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            style={{
              position: "relative", width: 140, height: 140, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: `radial-gradient(circle at 30% 30%, ${orbColor}20, ${orbColor}05)`,
              border: `2px solid ${orbColor}30`,
              boxShadow: `0 0 40px ${orbColor}15, inset 0 0 30px ${orbColor}08`,
              transition: "all 0.5s",
            }}
          >
            {(phase === "idle" || phase === "resolved" || phase === "summary") && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke={orbColor} strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4" />
                  <circle cx="24" cy="24" r="14" stroke={orbColor} strokeWidth="0.5" strokeDasharray="2 3" opacity="0.6" />
                  <circle cx="24" cy="24" r="5" fill={orbColor} opacity="0.8" />
                </svg>
              </motion.div>
            )}
            {(phase === "ingesting" || phase === "retrieving") && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                <Search style={{ width: 36, height: 36, color: orbColor }} />
              </motion.div>
            )}
            {phase === "speaking" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, height: 36 }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <span key={i} className="waveform-bar" style={{ background: orbColor }} />
                ))}
              </div>
            )}
          </motion.div>
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: orbColor, transition: "color 0.3s" }}>
              {phase === "idle" && "Awaiting Input"}
              {phase === "ingesting" && "Processing Query..."}
              {phase === "retrieving" && "Context Retrieval..."}
              {phase === "speaking" && "Generating Response..."}
              {phase === "resolved" && "✓ Resolved"}
              {phase === "summary" && "✓ Resolved"}
            </span>
          </div>
        </div>

        {/* Prompt Pills */}
        <div style={{ display: "flex", gap: 16, width: "100%", maxWidth: 680, flexWrap: "wrap", justifyContent: "center" }}>
          {(Object.entries(pills) as [keyof typeof pills, (typeof pills)[keyof typeof pills]][]).map(([key, pill]) => {
            const isActive = activePill === key;
            const isDisabled = phase !== "idle" && !isActive;

            return (
              <motion.button
                key={key}
                onClick={() => handlePillClick(key)}
                disabled={isDisabled}
                whileHover={!isDisabled ? { y: -4, scale: 1.02 } : {}}
                whileTap={!isDisabled ? { scale: 0.97 } : {}}
                animate={isActive && phase === "ingesting" ? { y: -8 } : isActive ? { y: -4 } : {}}
                style={{
                  flex: "1 1 180px", padding: "20px 20px", borderRadius: 20, textAlign: "left",
                  cursor: isDisabled ? "not-allowed" : "pointer", border: "none",
                  opacity: isDisabled ? 0.25 : 1,
                  background: isActive ? `${pill.color}0A` : "var(--bg)",
                  outline: isActive ? `2px solid ${pill.color}40` : "1px solid var(--border)",
                  boxShadow: isActive ? `0 0 24px ${pill.color}15` : "0 2px 12px rgba(0,0,0,0.3)",
                  transition: "all 0.3s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${pill.color}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <pill.icon style={{ width: 14, height: 14, color: pill.color }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: pill.color }}>
                    {pill.label}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
                  &quot;{pill.query}&quot;
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Context Panel */}
        <AnimatePresence>
          {showContext && currentPill && phase !== "idle" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={spring}
              style={{ width: "100%", maxWidth: 520 }}>
              <div style={{
                borderRadius: 16, padding: "16px 20px", fontFamily: "monospace", fontSize: 12,
                background: "var(--bg)", border: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366F1" }} />
                  <span style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Dynamic Context Retrieval</span>
                </div>
                {currentPill.retrievalSteps.map((step, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={i < retrievalStep ? { opacity: 1, x: 0 } : { opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    {i < retrievalStep - 1 ? (
                      <CheckCircle2 style={{ width: 12, height: 12, color: "#0EA5E9", flexShrink: 0 }} />
                    ) : i === retrievalStep - 1 ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
                        <Clock style={{ width: 12, height: 12, color: "#6366F1", flexShrink: 0 }} />
                      </motion.div>
                    ) : null}
                    <span style={{ color: "var(--text-secondary)" }}>{step}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Response */}
        <AnimatePresence>
          {(phase === "speaking" || phase === "resolved" || phase === "summary") && currentPill && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={spring}
              style={{ width: "100%", maxWidth: 520 }}>
              <div style={{
                padding: 24, borderRadius: 20,
                background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  {phase === "speaking" && (
                    <div style={{ display: "flex", gap: 1.5, height: 16 }}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <span key={i} className="waveform-bar" style={{ background: "#0EA5E9", width: 2 }} />
                      ))}
                    </div>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {phase === "speaking" ? "Speaking..." : "Response Complete"}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>
                  <span style={{ color: "#2997FF", fontWeight: 700 }}>Saathi: </span>
                  <span className={phase === "speaking" ? "typing-cursor" : ""}>{transcript}</span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ROI */}
        <AnimatePresence>
          {(phase === "resolved" || phase === "summary") && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ...spring }}
              style={{ width: "100%", maxWidth: 520 }}>
              <div style={{
                padding: 24, borderRadius: 20,
                background: "linear-gradient(135deg, rgba(14,165,233,0.05), rgba(41,151,255,0.03))",
                border: "1px solid rgba(14,165,233,0.12)",
              }}>
                <h4 style={{ fontSize: 18, fontWeight: 900, color: "var(--text-primary)", textAlign: "center", letterSpacing: "-0.02em", marginBottom: 4 }}>
                  Instant Resolution. Zero Human Cost.
                </h4>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center", marginBottom: 16 }}>
                  Saathi resolves 85% of tier-1 queries by querying live operational data.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {[
                    { label: "Avg Wait", value: "0 sec", color: "#0EA5E9" },
                    { label: "Overhead Saved", value: "100%", color: "#2997FF" },
                    { label: "Resolution", value: "<2 sec", color: "#6366F1" },
                  ].map((m) => (
                    <div key={m.label} style={{ textAlign: "center", padding: 12, borderRadius: 14, background: "rgba(0,0,0,0.4)" }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: m.color }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Toolbar */}
      <div style={{
        padding: "16px 36px 24px", borderTop: "1px solid var(--border)",
        display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleReset}
            style={{ padding: "8px 18px", fontSize: 12, fontWeight: 600, borderRadius: 12, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)" }}>
            <RotateCcw style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Reset
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => { setAudioEnabled(!audioEnabled); if (audioEnabled) stopSarvamAudio(); }}
            style={{ padding: "8px 18px", fontSize: 12, fontWeight: 600, borderRadius: 12, border: "none", cursor: "pointer", background: audioEnabled ? "rgba(41,151,255,0.08)" : "rgba(255,255,255,0.04)", color: audioEnabled ? "#2997FF" : "var(--text-secondary)" }}>
            {audioEnabled ? <Volume2 style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} /> : <VolumeX style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} />}
            Voice
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setShowContext(!showContext)}
            style={{ padding: "8px 18px", fontSize: 12, fontWeight: 600, borderRadius: 12, border: "none", cursor: "pointer", background: showContext ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.04)", color: showContext ? "#6366F1" : "var(--text-secondary)" }}>
            {showContext ? <Eye style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} /> : <EyeOff style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} />}
            Context
          </motion.button>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => { setNarratorEnabled(!narratorEnabled); if (narratorEnabled) stopSarvamAudio(); }}
            style={{ padding: "8px 18px", fontSize: 12, fontWeight: 600, borderRadius: 12, border: "none", cursor: "pointer", background: narratorEnabled ? "rgba(244,63,94,0.08)" : "rgba(255,255,255,0.04)", color: narratorEnabled ? "#F43F5E" : "var(--text-secondary)" }}>
            {narratorEnabled ? <Mic style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} /> : <MicOff style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} />}
            Narrator
          </motion.button>
        </div>

        {/* Phase pipeline */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {phases.map((label, i) => {
            const isActive = phase === phaseMap[label];
            const isPast = phases.indexOf(label) < phases.findIndex(p => phaseMap[p] === phase);
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: isActive ? "#0EA5E9" : isPast ? "#0EA5E9" : "var(--elevated)",
                  boxShadow: isActive ? "0 0 8px rgba(14,165,233,0.6)" : "none",
                  transition: "all 0.3s",
                }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? "#0EA5E9" : isPast ? "#0EA5E9" : "var(--text-tertiary)" }}>{label}</span>
                {i < phases.length - 1 && (
                  <div style={{ width: 12, height: 1, background: isPast ? "#0EA5E9" : "var(--elevated)", transition: "background 0.3s" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
