"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { speakAndWait, speakWithSarvam, stopSarvamAudio, estimateSpeechDuration, VOICE_PROFILES } from "@/lib/tts";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RotateCcw,
  Phone,
  PhoneCall,
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  Coffee,
  MessageSquare,
  Navigation,
  Shield,
  Award,
  Zap,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
} from "lucide-react";
import NarratorCaption from "@/components/NarratorCaption";

/* ── Mock candidate data ── */
const candidates = [
  { name: "Rohan V.", distance: 2.1, passed: true, score: 97.6, exp: "8 months cafe", ping: 14 },
  { name: "Priya M.", distance: 3.8, passed: true, score: 89.2, exp: "4 months retail", ping: 22 },
  { name: "Arjun K.", distance: 4.6, passed: true, score: 82.7, exp: "2 months events", ping: 31 },
  { name: "Sneha R.", distance: 6.2, passed: false, score: 0, exp: "N/A", ping: 0 },
  { name: "Vikram T.", distance: 7.9, passed: false, score: 0, exp: "N/A", ping: 0 },
];

/* ── Voice lines for speech synthesis ── */
const voiceLines = {
  narrator1: "Here's what happens the moment a merchant needs staff — Saathi doesn't wait for a human to start dialing. It instantly activates a 5-kilometer geo-fence around the merchant's location and begins parallel outreach.",
  narrator2: "Of those five candidates, three passed the radius check. Now watch how Saathi conducts voice screening — this call is fully autonomous, no human operator needed.",
  outreach: "Hi Rohan! This is Saathi calling from StudGoo. Third Wave Coffee in Indiranagar needs an experienced Barista tomorrow at 9 AM paying 160 rupees an hour. Are you available?",
  screening: "Great, Rohan. Have you worked with commercial espresso machines before, and can you commit to the full 6-hour shift?",
  narrator3: "The entire process — from merchant request to locked allocation — took under a minute. No founder time spent. The candidate is confirmed, the merchant is notified, and the shift is locked.",
};

type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

const spring = { type: "spring" as const, damping: 25, stiffness: 200 };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Simulation1() {
  const [stage, setStage] = useState<Stage>(0);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [narratorEnabled, setNarratorEnabled] = useState(true);
  
  const [narratorText, setNarratorText] = useState("");
  const [narratorPlaying, setNarratorPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [candidateReveal, setCandidateReveal] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(false);

  /* Timer logic */
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimer((t) => t + 100), 100);
    return () => clearInterval(id);
  }, [timerRunning]);

  const formatTimer = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const cs = Math.floor((ms % 1000) / 100);
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}.${cs}`;
  };

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

  const runSimulation = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    abortRef.current = false;
    setTimerRunning(true);

    // Narrator Beat 1
    await playNarrator(voiceLines.narrator1);
    if (abortRef.current) return;

    // Stage 1: Geo-Fence (Visualizing the map)
    setStage(1);
    setCandidateReveal(0);
    await delay(1500);
    if (abortRef.current) return;

    // Stage 2: Autonomous Dialing
    setStage(2);
    for (let i = 1; i <= 5; i++) {
      await delay(400);
      if (abortRef.current) return;
      setCandidateReveal(i);
    }
    await delay(1500);
    if (abortRef.current) return;

    // Stage 3: Screening Intro (Narrator Beat 2)
    setStage(3);
    await playNarrator(voiceLines.narrator2);
    if (abortRef.current) return;

    // Stage 4: Voice Screening
    setStage(4);
    
    let durationOutreach = estimateSpeechDuration(voiceLines.outreach);
    let audioEndPromiseOutreach = Promise.resolve();

    if (audioEnabled) {
      stopSarvamAudio();
      const audio = await speakWithSarvam({
        text: voiceLines.outreach,
        language_code: VOICE_PROFILES.sim1.languageCode,
        speaker: VOICE_PROFILES.sim1.speaker,
        pace: 1.0,
      });
      if (audio) {
        durationOutreach = (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) 
          ? audio.duration * 1000 : durationOutreach;
        audioEndPromiseOutreach = new Promise(resolve => {
          const tId = setTimeout(resolve, durationOutreach + 2000);
          const endCb = () => { clearTimeout(tId); resolve(undefined); };
          audio.addEventListener("ended", endCb, { once: true });
          audio.addEventListener("error", endCb, { once: true });
        });
      }
    }
    
    streamText(voiceLines.outreach, durationOutreach);
    
    if (audioEnabled) {
      await audioEndPromiseOutreach;
    } else {
      await delay(durationOutreach);
    }
    if (abortRef.current) return;
    
    await delay(1000); // gap
    if (abortRef.current) return;

    // Stage 5: Score
    setStage(5);
    if (audioEnabled) {
      await speakAndWait({
        text: voiceLines.screening,
        language_code: VOICE_PROFILES.sim1.languageCode,
        speaker: VOICE_PROFILES.sim1.speaker,
        pace: 1.0,
      });
    } else {
      await delay(estimateSpeechDuration(voiceLines.screening));
    }
    if (abortRef.current) return;
    
    // Stage 6: WhatsApp Dispatch
    setStage(6);
    await delay(3500);
    if (abortRef.current) return;

    // Stage 7: Confirmed
    setStage(7);
    setTimerRunning(false);
    
    await playNarrator(voiceLines.narrator3);
    
    setIsRunning(false);
  }, [audioEnabled, narratorEnabled, isRunning, streamText]);

  const handleStart = () => {
    setTimer(0);
    runSimulation();
  };

  const handleReset = () => {
    abortRef.current = true;
    stopSarvamAudio();
    setStage(0);
    setTimer(0);
    setTimerRunning(false);
    setTranscript("");
    setCandidateReveal(0);
    setSelectedCandidate(null);
    setIsRunning(false);
    setNarratorText("");
    setNarratorPlaying(false);
  };

  const stagesLabel = ["Trigger", "Geo-Fence", "Dialing", "Intro", "Screening", "Score", "WhatsApp", "Confirmed"];

  return (
    <div className="glass-card" style={{ background: "var(--surface)", borderRadius: 28, position: "relative", overflow: "hidden", border: "1px solid var(--border)" }}>
      {/* Ambient glow */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[radial-gradient(circle,#2997FF30,transparent_70%)] pointer-events-none" />

      {/* Header */}
      <div style={{ padding: "32px 36px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div className="glow-pulse-blue" style={{ width: 8, height: 8, borderRadius: "50%", background: "#2997FF" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2997FF" }}>
              Simulation 1
            </span>
          </div>
          <h3 style={{ fontSize: 26, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 6 }}>
            Hyperlocal Candidate Acquisition
          </h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 420 }}>
            Watch Saathi screen, verify, and auto-allocate a candidate in real time.
          </p>
        </div>
        {/* Elapsed Timer */}
        <div style={{ padding: "12px 20px", borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", textAlign: "center", flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 2 }}>Elapsed</div>
          <div style={{ fontSize: 22, fontFamily: "monospace", fontWeight: 800, color: "#2997FF" }}>
            {formatTimer(timer)}
          </div>
        </div>
      </div>

      {/* ── Stage Content ── */}
      <div style={{ padding: "40px 36px 32px", minHeight: 480, position: "relative" }}>
        {/* Narrator Overlay Layer */}
        <NarratorCaption 
          text={narratorText} 
          isPlaying={narratorPlaying} 
          visible={!!narratorText} 
        />

        <AnimatePresence mode="wait">
          {/* STAGE 0: Shift Dispatch Trigger */}
          {stage === 0 && (
            <motion.div key="stage0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={spring}>
              <div style={{ padding: 24, borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", maxWidth: 520, margin: "0 auto 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,159,10,0.1)", border: "1px solid rgba(255,159,10,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Coffee style={{ width: 20, height: 20, color: "#FF9F0A" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Third Wave Roasters, Indiranagar</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Active Merchant • 4.8★</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ padding: 14, borderRadius: 14, background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Role</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Lead Barista (Specialty Espresso)</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 14, background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Pay Rate</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#30D158" }}>₹160/hr • 6-Hour Shift</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 14, background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Schedule</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Tomorrow, 9:00 AM</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 14, background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Radius Limit</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#2997FF" }}>5.0 km Geo-Fence</div>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <motion.button onClick={handleStart} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="aurora-gradient"
                  style={{ padding: "16px 36px", fontSize: 15, fontWeight: 700, color: "white", border: "none", cursor: "pointer", borderRadius: 18, boxShadow: "0 8px 30px rgba(41,151,255,0.3)", display: "flex", alignItems: "center", gap: 10, margin: "0 auto" }}>
                  <Play style={{ width: 18, height: 18 }} />
                  Run Saathi Match Engine
                  <Zap style={{ width: 14, height: 14 }} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STAGE 1: Geo-Fence (Visualizing the map) */}
          {stage === 1 && (
            <motion.div key="stage1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={spring} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
              <div style={{ position: "relative", width: 320, height: 320, margin: "0 auto" }}>
                {[1, 3, 5].map((km) => (
                  <motion.div key={km} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: km * 0.1, duration: 0.5 }}
                    style={{ position: "absolute", borderRadius: "50%", border: "1px solid rgba(41,151,255,0.2)", width: `${(km / 5) * 100}%`, height: `${(km / 5) * 100}%`, top: `${50 - (km / 5) * 50}%`, left: `${50 - (km / 5) * 50}%` }}>
                    <span style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "var(--text-secondary)" }}>{km} km</span>
                  </motion.div>
                ))}
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} style={{ position: "absolute", inset: 0, transformOrigin: "center center" }}>
                  <div style={{ position: "absolute", top: "50%", left: "50%", width: "50%", height: 2, background: "linear-gradient(90deg, rgba(41,151,255,0.5), transparent)", transformOrigin: "left center" }} />
                </motion.div>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FF9F0A", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(255,159,10,0.4)" }}>
                    <Coffee style={{ width: 14, height: 14, color: "white" }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: Autonomous Dialing */}
          {stage === 2 && (
            <motion.div key="stage2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={spring} style={{ maxWidth: 560, margin: "0 auto" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <PhoneCall style={{ width: 16, height: 16, color: "#2997FF" }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "#2997FF" }}>Autonomous Parallel Dialing — Scanning candidate pool...</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {candidates.map((c, i) => (
                  <motion.div key={c.name} initial={{ opacity: 0, x: -20 }} animate={i < candidateReveal ? { opacity: 1, x: 0 } : { opacity: 0.2, x: 0 }} transition={{ duration: 0.3 }}
                    style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800,
                      background: i < candidateReveal ? (c.passed ? "rgba(48,209,88,0.15)" : "rgba(255,69,58,0.1)") : "rgba(255,255,255,0.05)",
                      color: i < candidateReveal ? (c.passed ? "#30D158" : "#FF453A") : "var(--text-secondary)",
                      border: `1px solid ${i < candidateReveal ? (c.passed ? "rgba(48,209,88,0.3)" : "rgba(255,69,58,0.2)") : "transparent"}`
                    }}>
                      {i < candidateReveal ? (c.passed ? "✓" : "✗") : "..."}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{i < candidateReveal ? `${c.distance} km away` : "Dialing..."}</div>
                    </div>
                    {i < candidateReveal && (
                      <div style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 12,
                        background: c.passed ? "rgba(48,209,88,0.1)" : "rgba(255,69,58,0.1)",
                        color: c.passed ? "#30D158" : "#FF453A"
                      }}>
                        {c.passed ? `Within Radius (${c.distance} km)` : `Outside Boundary (${c.distance} km)`}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STAGE 3: Screening Intro (Show Map Results) */}
          {stage === 3 && (
            <motion.div key="stage3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={spring} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
              <div style={{ position: "relative", width: 320, height: 320, margin: "0 auto" }}>
                {[1, 3, 5].map((km) => (
                  <div key={km} style={{ position: "absolute", borderRadius: "50%", border: "1px solid rgba(41,151,255,0.15)", width: `${(km / 5) * 100}%`, height: `${(km / 5) * 100}%`, top: `${50 - (km / 5) * 50}%`, left: `${50 - (km / 5) * 50}%` }}>
                    <span style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "var(--text-secondary)" }}>{km} km</span>
                  </div>
                ))}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#FF9F0A", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(255,159,10,0.4)" }}>
                    <Coffee style={{ width: 14, height: 14, color: "white" }} />
                  </div>
                </div>
                {candidates.map((c, i) => {
                  const angle = (i * 72 + 30) * (Math.PI / 180);
                  const normalizedDist = Math.min(c.distance / 5, 1.4);
                  const x = 50 + normalizedDist * 42 * Math.cos(angle);
                  const y = 50 + normalizedDist * 42 * Math.sin(angle);
                  return (
                    <motion.div key={c.name} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={spring}
                      style={{ position: "absolute", zIndex: 10, top: `${y}%`, left: `${x}%`, transform: "translate(-50%, -50%)", cursor: "pointer" }} onClick={() => setSelectedCandidate(i)}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800,
                        background: c.passed ? "#30D158" : "#FF453A", color: "white", boxShadow: `0 0 16px ${c.passed ? "rgba(48,209,88,0.4)" : "rgba(255,69,58,0.4)"}` }}>
                        {c.name.charAt(0)}
                      </div>
                      <div style={{ position: "absolute", bottom: -24, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: c.passed ? "rgba(48,209,88,0.15)" : "rgba(255,69,58,0.15)", color: c.passed ? "#30D158" : "#FF453A" }}>
                          {c.distance} km
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STAGE 4: Voice Screening */}
          {stage === 4 && (
            <motion.div key="stage4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={spring} className="perspective-deep" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
              <motion.div initial={{ rotateX: 20, rotateY: -10, scale: 0.9 }} animate={{ rotateX: 6, rotateY: -4, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="phone-frame phone-glow-cyan" style={{ width: 240, height: 480 }}>
                <div className="phone-screen" style={{ background: "linear-gradient(180deg, #000 0%, #1D1D1F 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "44px 16px 16px" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #2997FF, #BF48FF)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 0 40px rgba(41,151,255,0.4)" }}>
                    <PhoneCall style={{ width: 28, height: 28, color: "white" }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 4 }}>StudGoo Smart Relay</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
                    <Shield style={{ width: 12, height: 12, color: "#30D158" }} />
                    <span style={{ fontSize: 11, color: "#30D158" }}>Saathi Cognitive Engine</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, height: 32, marginBottom: 16 }}>
                    {Array.from({ length: 12 }).map((_, i) => (<span key={i} className="waveform-bar" style={{ background: "#2997FF" }} />))}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Active Call — Rohan V.</div>
                </div>
              </motion.div>

              <div style={{ padding: 24, borderRadius: 24, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", width: "100%", maxWidth: 560 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div className="glow-pulse-blue" style={{ width: 8, height: 8, borderRadius: "50%", background: "#30D158" }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.15em" }}>Live Kinetic Transcript</span>
                </div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, minHeight: 80 }}>
                  <span style={{ color: "#2997FF", fontWeight: 700 }}>Saathi: </span>
                  <span className="typing-cursor">{transcript}</span>
                </div>
                {transcript.length > 100 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ color: "#30D158", fontWeight: 700, fontSize: 14 }}>Rohan: </span>
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>&quot;Yes! I can make it. Send me the location link.&quot;</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* STAGE 5: Score */}
          {stage === 5 && (
            <motion.div key="stage5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={spring} style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 560, margin: "0 auto" }}>
              <div style={{ padding: 32, borderRadius: 28, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg, #30D158, #2997FF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Award style={{ width: 24, height: 24, color: "white" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>Autonomous Allocation Matrix</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Top Candidate: Rohan V.</div>
                  </div>
                </div>
                {[
                  { label: "Commute Proximity", value: "2.1 km", score: 98, color: "#30D158" },
                  { label: "Availability Timing", value: "Immediate / Confirmed", score: 100, color: "#2997FF" },
                  { label: "Category Skill Match", value: "Level 4 Barista", score: 95, color: "#BF48FF" },
                ].map((metric, i) => (
                  <motion.div key={metric.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, marginBottom: 12, borderRadius: 16, background: "rgba(0,0,0,0.2)" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>{metric.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{metric.value}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 80, height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${metric.score}%` }} transition={{ delay: 0.5 + i * 0.2, duration: 0.6 }} style={{ height: "100%", background: metric.color }} />
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 800, color: metric.color }}>{metric.score}</span>
                    </div>
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}
                  style={{ marginTop: 24, padding: 20, borderRadius: 20, background: "rgba(48,209,88,0.1)", border: "1px solid rgba(48,209,88,0.2)", textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>Composite Saathi Match Index</div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: "#30D158" }} className="text-glow-emerald">97.6%</div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* STAGE 6: WhatsApp Dispatch */}
          {stage === 6 && (
            <motion.div key="stage6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={spring} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
              <div className="perspective-deep">
                <motion.div initial={{ rotateX: 15, scale: 0.9 }} animate={{ rotateX: 4, scale: 1 }} transition={{ duration: 0.6 }} className="phone-frame phone-glow-emerald" style={{ width: 240, height: 480 }}>
                  <div className="phone-screen" style={{ background: "linear-gradient(180deg, #000 0%, #1D1D1F 100%)", display: "flex", flexDirection: "column", padding: "44px 16px 16px" }}>
                    <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, ...spring }}
                      style={{ background: "rgba(48,209,88,0.15)", border: "1px solid rgba(48,209,88,0.25)", borderRadius: 16, padding: 12, marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <MessageSquare style={{ width: 14, height: 14, color: "#30D158" }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#30D158" }}>WhatsApp • StudGoo Bot</span>
                      </div>
                      <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>Tap to verify your shift slot</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, duration: 0.4 }}
                      style={{ background: "rgba(48,209,88,0.08)", border: "1px solid rgba(48,209,88,0.15)", borderRadius: 20, borderTopLeftRadius: 4, padding: 16, marginTop: "auto", marginBottom: 16 }}>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12, marginTop: 0 }}>
                        Hey Rohan 👋 tap below to confirm your live GPS location and lock your shift slot at Indiranagar:
                      </p>
                      <motion.button animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                        style={{ width: "100%", padding: "10px 0", background: "#30D158", color: "white", fontSize: 13, fontWeight: 700, borderRadius: 12, border: "none" }}>
                        🔗 Verify Shift #SG-884
                      </motion.button>
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ delay: 2, duration: 0.6 }}
                      style={{ position: "absolute", bottom: 90, left: "50%", transform: "translateX(-50%)" }}>
                      <Navigation style={{ width: 24, height: 24, color: "#2997FF", transform: "rotate(180deg)" }} />
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
                style={{ padding: "12px 24px", borderRadius: 16, background: "rgba(48,209,88,0.1)", border: "1px solid rgba(48,209,88,0.2)" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#30D158" }}>✓ Location verified — GPS coordinates captured</div>
              </motion.div>
            </motion.div>
          )}

          {/* STAGE 7: Confirmed */}
          {stage === 7 && (
            <motion.div key="stage7" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={spring} style={{ display: "flex", flexDirection: "column", gap: 32, maxWidth: 560, margin: "0 auto" }}>
              <motion.div 
                style={{ padding: 32, borderRadius: 24, background: "linear-gradient(135deg, rgba(48,209,88,0.1), rgba(41,151,255,0.05))", border: "1px solid rgba(48,209,88,0.2)", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
                  <CheckCircle2 style={{ width: 28, height: 28, color: "#30D158" }} />
                  <span style={{ fontSize: 24, fontWeight: 900, color: "var(--text-primary)" }}>CANDIDATE AUTO-ALLOCATED</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#30D158", marginBottom: 24 }}>Total Time: {formatTimer(timer)}</div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
                  <div style={{ background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 16 }}>
                    <div style={{ color: "var(--text-secondary)", marginBottom: 4 }}>Founder Time Spent</div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: 18 }}>0 Minutes</div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 16 }}>
                    <div style={{ color: "var(--text-secondary)", marginBottom: 4 }}>Merchant Status</div>
                    <div style={{ fontWeight: 700, color: "#2997FF", fontSize: 18 }}>Notified ✓</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Toolbar ── */}
      <div style={{ padding: "16px 36px 24px", borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleStart} disabled={isRunning}
            style={{ padding: "8px 18px", fontSize: 12, fontWeight: 700, borderRadius: 12, border: "none", cursor: isRunning ? "not-allowed" : "pointer", background: "rgba(41,151,255,0.1)", color: "#2997FF", opacity: isRunning ? 0.3 : 1 }}>
            ▶ Run Simulation
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleReset}
            style={{ padding: "8px 18px", fontSize: 12, fontWeight: 600, borderRadius: 12, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)" }}>
            <RotateCcw style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Reset
          </motion.button>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.1)", margin: "0 8px" }} />
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => { setAudioEnabled(!audioEnabled); if (audioEnabled) stopSarvamAudio(); }}
            style={{ padding: "8px 18px", fontSize: 12, fontWeight: 600, borderRadius: 12, border: "none", cursor: "pointer", background: audioEnabled ? "rgba(41,151,255,0.08)" : "rgba(255,255,255,0.04)", color: audioEnabled ? "#2997FF" : "var(--text-secondary)" }}>
            {audioEnabled ? <Volume2 style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} /> : <VolumeX style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} />}
            Voice
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => { setNarratorEnabled(!narratorEnabled); if (narratorEnabled) stopSarvamAudio(); }}
            style={{ padding: "8px 18px", fontSize: 12, fontWeight: 600, borderRadius: 12, border: "none", cursor: "pointer", background: narratorEnabled ? "rgba(255,38,185,0.08)" : "rgba(255,255,255,0.04)", color: narratorEnabled ? "#FF26B9" : "var(--text-secondary)" }}>
            {narratorEnabled ? <Mic style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} /> : <MicOff style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} />}
            Narrator
          </motion.button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {stagesLabel.map((label, i) => {
            const isActive = stage === i;
            const isPast = stage > i;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? "#2997FF" : isPast ? "#30D158" : "var(--elevated)", boxShadow: isActive ? "0 0 8px rgba(41,151,255,0.6)" : "none", transition: "all 0.3s" }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? "#2997FF" : isPast ? "#30D158" : "var(--text-tertiary)" }}>{label}</span>
                {i < stagesLabel.length - 1 && <div style={{ width: 12, height: 1, background: isPast ? "#30D158" : "var(--elevated)", transition: "background 0.3s" }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
