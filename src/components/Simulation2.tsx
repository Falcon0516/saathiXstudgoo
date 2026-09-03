"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, RotateCcw, Phone, PhoneCall, PhoneIncoming,
  Shield, Lock, Eye, EyeOff, CheckCircle2, Users,
  Volume2, VolumeX, Mic, MicOff,
} from "lucide-react";
import { speakAndWait, stopSarvamAudio, estimateSpeechDuration, VOICE_PROFILES } from "@/lib/tts";
import NarratorCaption from "@/components/NarratorCaption";

type Stage = 0 | 1 | 2 | 3 | 4 | 5;

const terminalLines = [
  { text: "> Incoming call intercepted: Merchant → Relay", delay: 0, color: "var(--text-secondary)" },
  { text: "> [SHIELD] Origin identity masked via Secure Proxy", delay: 700, color: "#30D158" },
  { text: "> Querying active booking: #SG-402", delay: 1400, color: "var(--text-secondary)" },
  { text: "> Target resolved: Student Rohan (+91-XXXXX-XXXXX)", delay: 2100, color: "#2997FF" },
  { text: "> [BRIDGE] Routing masked connection...", delay: 2800, color: "#BF48FF" },
  { text: "> ✓ Bidirectional channel established", delay: 3400, color: "#30D158" },
];

const stageNarrations: Record<string, string> = {
  intro: "This is the disintermediation problem — when merchants and students share real phone numbers, 30 to 40 percent of future transactions bypass StudGoo. Watch how masked routing eliminates this.",
  intercept: "Call intercepted. The Core Orchestration Engine is masking the origin identity and resolving the target.",
  analysis: "Neither party ever sees the other's real number. The platform retains full control of the relationship — zero leakage.",
};

const spring = { type: "spring" as const, damping: 25, stiffness: 200 };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Simulation2() {
  const [stage, setStage] = useState<Stage>(0);
  const [xRayMode, setXRayMode] = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [callTimer, setCallTimer] = useState(0);
  const [callActive, setCallActive] = useState(false);
  
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [narratorEnabled, setNarratorEnabled] = useState(true);
  const [narratorText, setNarratorText] = useState("");
  const [narratorPlaying, setNarratorPlaying] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef(false);

  useEffect(() => {
    if (!callActive) return;
    const id = setInterval(() => setCallTimer((t) => t + 100), 100);
    return () => clearInterval(id);
  }, [callActive]);

  const formatCall = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

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

  const speakSimVoice = async (text: string) => {
    if (!audioEnabled) {
      await delay(estimateSpeechDuration(text));
      return;
    }
    await speakAndWait({
      text,
      language_code: VOICE_PROFILES.sim2.languageCode,
      speaker: VOICE_PROFILES.sim2.speaker,
      pace: 1.0,
    });
  };

  const runSimulation = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    abortRef.current = false;

    // Stage 0.5: Intro Narrator
    await playNarrator(stageNarrations.intro);
    if (abortRef.current) return;

    // Stage 1: Dialing
    setStage(1);
    await delay(2000);
    if (abortRef.current) return;

    // Stage 2: Intercept + terminal
    setStage(2);
    setVisibleLines(0);
    terminalLines.forEach((_, i) => {
      setTimeout(() => { if (!abortRef.current) setVisibleLines(i + 1); }, terminalLines[i].delay);
    });
    // While terminal is typing, we play the sim voice for intercept
    await speakSimVoice(stageNarrations.intercept);
    if (abortRef.current) return;

    // Stage 3: Routing
    setStage(3);
    await delay(2500);
    if (abortRef.current) return;

    // Stage 4: Connected
    setStage(4);
    setCallActive(true);
    await delay(3500);
    if (abortRef.current) return;
    
    // Stage 5: Analysis Narrator
    setStage(5);
    await playNarrator(stageNarrations.analysis);

    setIsRunning(false);
  }, [audioEnabled, narratorEnabled, isRunning]);

  const handleReset = () => {
    abortRef.current = true;
    stopSarvamAudio();
    setStage(0);
    setVisibleLines(0);
    setCallTimer(0);
    setCallActive(false);
    setIsRunning(false);
    setNarratorText("");
    setNarratorPlaying(false);
  };

  const stagesLabel = ["Setup", "Dialing", "Intercept", "Routing", "Connected", "Analysis"];

  return (
    <div className="glass-card" style={{ background: "var(--surface)", borderRadius: 28, padding: 0, position: "relative", overflow: "hidden", border: "1px solid var(--border)" }}>
      {/* Header */}
      <div style={{ padding: "32px 36px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div className="glow-pulse-aurora" style={{ width: 8, height: 8, borderRadius: "50%", background: "#BF48FF" }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#BF48FF" }}>
              Simulation 2
            </span>
          </div>
          <h3 style={{ fontSize: 26, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em", marginBottom: 6 }}>
            Masked Call Bridge
          </h3>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", maxWidth: 400 }}>
            Real phone numbers stay 100% hidden during all merchant–student communication.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 12, background: "rgba(191,72,255,0.08)", border: "1px solid rgba(191,72,255,0.15)" }}>
          <Lock style={{ width: 13, height: 13, color: "#BF48FF" }} />
          <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>Secure Telephony Proxy</span>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="perspective-deep" style={{ padding: "40px 36px 32px", minHeight: 520, position: "relative" }}>
        <NarratorCaption 
          text={narratorText} 
          isPlaying={narratorPlaying} 
          visible={!!narratorText} 
          accentColor="#FF26B9"
        />

        {/* Stage 0: Idle */}
        {stage === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, ...spring }}
              style={{ padding: "16px 24px", borderRadius: 16, marginBottom: 40, maxWidth: 420, width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(191,72,255,0.1)", border: "1px solid rgba(191,72,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users style={{ width: 20, height: 20, color: "#BF48FF" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Active Booking #SG-402</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Grade 10 Mathematics Tutor</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Pay Rate</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#30D158" }}>₹200/hr</div>
              </div>
            </motion.div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 60, marginBottom: 48 }}>
              <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3, ...spring }} style={{ textAlign: "center" }}>
                <div className="phone-frame phone-3d-left" style={{ width: 200, height: 400, margin: "0 auto 12px" }}>
                  <div className="phone-screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "44px 16px 16px" }}>
                    <Users style={{ width: 28, height: 28, color: "#2997FF", opacity: 0.4, marginBottom: 12 }} />
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Merchant Phone</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>Star Events</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#2997FF" }}>Client / Parent</span>
              </motion.div>

              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, ...spring }} className="float-zero-g" style={{ textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: 22, background: "rgba(191,72,255,0.06)", border: "1px solid rgba(191,72,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
                  <Shield style={{ width: 28, height: 28, color: "#BF48FF", opacity: 0.4 }} />
                </div>
                <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Saathi Proxy</span>
              </motion.div>

              <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3, ...spring }} style={{ textAlign: "center" }}>
                <div className="phone-frame phone-3d-right" style={{ width: 200, height: 400, margin: "0 auto 12px" }}>
                  <div className="phone-screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "44px 16px 16px" }}>
                    <Phone style={{ width: 24, height: 24, color: "#30D158", opacity: 0.3, marginBottom: 12 }} />
                    <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Student Phone</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>Idle</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#30D158" }}>Student Tutor</span>
              </motion.div>
            </div>

            <motion.button onClick={runSimulation} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="aurora-gradient"
              style={{ padding: "16px 36px", fontSize: 15, fontWeight: 700, color: "white", border: "none", cursor: "pointer", borderRadius: 18, boxShadow: "0 8px 30px rgba(191,72,255,0.3)", display: "flex", alignItems: "center", gap: 10 }}>
              <Play style={{ width: 18, height: 18 }} />
              Simulate Masked Call
            </motion.button>
          </motion.div>
        )}

        {/* Stages 1-5: Active */}
        {stage >= 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, marginBottom: 32, width: "100%" }}>
              {/* Merchant Phone */}
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <motion.div className={`phone-frame phone-3d-left ${stage >= 4 ? "phone-glow-cyan" : ""}`}
                  animate={stage === 1 ? { boxShadow: "0 0 40px rgba(41,151,255,0.35)" } : {}}
                  style={{ width: 200, height: 400, margin: "0 auto 10px" }}>
                  <div className="phone-screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "44px 16px 16px" }}>
                    {stage === 1 && (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center" }}>
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                          <PhoneCall style={{ width: 32, height: 32, color: "#2997FF", margin: "0 auto 12px" }} />
                        </motion.div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Calling</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>+91 80 4XXX XXXX</div>
                        <div style={{ fontSize: 10, color: "#2997FF", marginTop: 4 }}>StudGoo Virtual Number</div>
                        {xRayMode && (
                          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            style={{ marginTop: 12, padding: "6px 12px", borderRadius: 8, background: "rgba(255,38,185,0.1)", border: "1px solid rgba(255,38,185,0.2)" }}>
                            <div style={{ fontSize: 10, color: "#FF26B9", textDecoration: "line-through" }}>+91-98765-43210</div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: "#FF26B9" }}>REAL # BLOCKED</div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                    {(stage === 2 || stage === 3) && (
                      <div style={{ textAlign: "center" }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                          <Phone style={{ width: 24, height: 24, color: "#BF48FF", margin: "0 auto 8px" }} />
                        </motion.div>
                        <div style={{ fontSize: 11, color: "#BF48FF" }}>Connecting...</div>
                      </div>
                    )}
                    {stage >= 4 && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(48,209,88,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                          <PhoneCall style={{ width: 22, height: 22, color: "#30D158" }} />
                        </div>
                        <div style={{ fontSize: 11, color: "#30D158", marginBottom: 4 }}>Connected</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "monospace", letterSpacing: "0.05em" }}>{formatCall(callTimer)}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, marginTop: 16, height: 28 }}>
                          {Array.from({ length: 10 }).map((_, i) => (<span key={i} className="waveform-bar" />))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
                <span style={{ fontSize: 11, color: "#2997FF", fontWeight: 600 }}>Client / Parent</span>
              </div>

              {/* Center Proxy */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, minWidth: 160 }}>
                {stage === 1 && (
                  <div style={{ position: "relative", width: "100%", height: 8 }}>
                    <div style={{ position: "absolute", inset: "50% 0", height: 1, background: "linear-gradient(90deg, rgba(41,151,255,0.3), transparent)" }} />
                    <motion.div animate={{ x: [0, 120], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity }}
                      style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: "#2997FF", boxShadow: "0 0 12px rgba(41,151,255,0.8)" }} />
                  </div>
                )}
                <motion.div animate={stage >= 2 ? { scale: [1, 1.05, 1] } : {}} transition={{ repeat: Infinity, duration: 2.5 }}
                  className={stage >= 2 ? "glow-pulse-aurora" : "float-zero-g"}
                  style={{ width: 80, height: 80, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", background: stage >= 2 ? "rgba(191,72,255,0.12)" : "rgba(191,72,255,0.04)", border: stage >= 2 ? "2px solid rgba(191,72,255,0.4)" : "1px solid rgba(191,72,255,0.1)", transition: "all 0.5s" }}>
                  {stage >= 2 ? (
                    <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={spring}>
                      <Lock style={{ width: 28, height: 28, color: "#BF48FF" }} />
                    </motion.div>
                  ) : (<Shield style={{ width: 28, height: 28, color: "#BF48FF", opacity: 0.4 }} />)}
                </motion.div>
                <span style={{ fontSize: 10, color: "#BF48FF", fontWeight: 600 }}>Core Engine</span>
                {stage === 3 && (
                  <div style={{ position: "relative", width: "100%", height: 8 }}>
                    <div style={{ position: "absolute", inset: "50% 0", height: 1, background: "linear-gradient(90deg, transparent, rgba(48,209,88,0.3))" }} />
                    <motion.div animate={{ x: [0, 120], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity }}
                      style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: "#30D158", boxShadow: "0 0 12px rgba(48,209,88,0.8)" }} />
                  </div>
                )}
              </div>

              {/* Student Phone */}
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <motion.div className={`phone-frame phone-3d-right ${stage >= 4 ? "phone-glow-emerald" : ""}`}
                  animate={stage === 3 ? { boxShadow: "0 0 40px rgba(48,209,88,0.35)" } : {}}
                  style={{ width: 200, height: 400, margin: "0 auto 10px" }}>
                  <div className="phone-screen" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "44px 16px 16px" }}>
                    {stage < 3 && (
                      <div style={{ textAlign: "center", opacity: 0.3 }}>
                        <Phone style={{ width: 24, height: 24, color: "#30D158", margin: "0 auto 8px" }} />
                        <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>Idle</div>
                      </div>
                    )}
                    {stage === 3 && (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: "center" }}>
                        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                          <PhoneIncoming style={{ width: 32, height: 32, color: "#30D158", margin: "0 auto 12px" }} />
                        </motion.div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 4 }}>Incoming Call</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>StudGoo Relay</div>
                        {xRayMode && (
                          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            style={{ marginTop: 12, padding: "6px 12px", borderRadius: 8, background: "rgba(255,38,185,0.1)", border: "1px solid rgba(255,38,185,0.2)" }}>
                            <div style={{ fontSize: 10, color: "#FF26B9", textDecoration: "line-through" }}>+91-91234-56789</div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: "#FF26B9" }}>REAL # BLOCKED</div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                    {stage >= 4 && (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(48,209,88,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                          <PhoneCall style={{ width: 22, height: 22, color: "#30D158" }} />
                        </div>
                        <div style={{ fontSize: 11, color: "#30D158", marginBottom: 4 }}>Connected</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "monospace" }}>{formatCall(callTimer)}</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, marginTop: 16, height: 28 }}>
                          {Array.from({ length: 10 }).map((_, i) => (<span key={i} className="waveform-bar" style={{ background: "#30D158" }} />))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
                <span style={{ fontSize: 11, color: "#30D158", fontWeight: 600 }}>Student Tutor</span>
              </div>
            </div>

            {/* Terminal */}
            <AnimatePresence>
              {stage === 2 && (
                <motion.div initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  style={{ width: "100%", maxWidth: 520, marginBottom: 20 }}>
                  <div style={{ borderRadius: 16, padding: "16px 20px", fontFamily: "monospace", fontSize: 12, background: "var(--bg)", border: "1px solid var(--border)", boxShadow: "inset 0 0 30px rgba(0,0,0,0.5)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF453A" }} />
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFD60A" }} />
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#30D158" }} />
                      <span style={{ fontSize: 10, color: "var(--text-tertiary)", marginLeft: 8 }}>Core Engine — Live</span>
                    </div>
                    {terminalLines.map((line, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={i < visibleLines ? { opacity: 1, x: 0 } : { opacity: 0 }} transition={{ duration: 0.3 }}
                        style={{ color: line.color, marginBottom: 6, lineHeight: 1.5 }}>{line.text}</motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Connected: Chat + ROI */}
            <AnimatePresence>
              {stage >= 4 && (
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, ...spring }}
                  style={{ width: "100%", maxWidth: 520 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }}
                      style={{ display: "flex", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 10, background: "rgba(41,151,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#2997FF" }}>P</span>
                      </div>
                      <div style={{ padding: "10px 16px", borderRadius: 16, borderBottomLeftRadius: 4, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", maxWidth: "80%" }}>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>&quot;Hi Rohan, confirming Algebra tomorrow at 4 PM?&quot;</p>
                      </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2 }}
                      style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                      <div style={{ padding: "10px 16px", borderRadius: 16, borderBottomRightRadius: 4, background: "rgba(48,209,88,0.08)", border: "1px solid rgba(48,209,88,0.12)", maxWidth: "80%" }}>
                        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>&quot;Yes! Practice sheets are ready.&quot;</p>
                      </div>
                      <div style={{ width: 28, height: 28, borderRadius: 10, background: "rgba(48,209,88,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#30D158" }}>R</span>
                      </div>
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {stage >= 5 && (
                      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, ...spring }}
                        style={{ padding: 28, borderRadius: 24, background: "linear-gradient(135deg, rgba(191,72,255,0.06), rgba(41,151,255,0.03))", border: "1px solid rgba(191,72,255,0.12)" }}>
                        <div style={{ textAlign: "center", marginBottom: 20 }}>
                          <h4 style={{ fontSize: 20, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Numbers remain 100% hidden.</h4>
                          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>Platform commissions preserved. Off-platform poaching eliminated.</p>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                          {[
                            { label: "Leakage Risk", value: "0%", color: "#30D158" },
                            { label: "Margin Retained", value: "100%", color: "#2997FF" },
                            { label: "Compliance", value: "Encrypted", color: "#BF48FF" },
                          ].map((m) => (
                            <div key={m.label} style={{ textAlign: "center", padding: 14, borderRadius: 16, background: "rgba(0,0,0,0.4)" }}>
                              <div style={{ fontSize: 22, fontWeight: 900, color: m.color }}>{m.value}</div>
                              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>{m.label}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 16, padding: 12, borderRadius: 14, border: "1px solid rgba(48,209,88,0.15)", background: "rgba(48,209,88,0.04)", textAlign: "center" }}>
                          <CheckCircle2 style={{ width: 14, height: 14, color: "#30D158", display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#30D158" }}>MERCHANTS CANNOT BYPASS STUDGOO</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Bottom Toolbar */}
      <div style={{ padding: "16px 36px 24px", borderTop: "1px solid var(--border)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={runSimulation} disabled={isRunning}
            style={{ padding: "8px 18px", fontSize: 12, fontWeight: 700, borderRadius: 12, border: "none", cursor: isRunning ? "not-allowed" : "pointer", background: "rgba(191,72,255,0.1)", color: "#BF48FF", opacity: isRunning ? 0.3 : 1 }}>
            ▶ Run Simulation
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleReset}
            style={{ padding: "8px 18px", fontSize: 12, fontWeight: 600, borderRadius: 12, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "var(--text-secondary)" }}>
            <RotateCcw style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Reset
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setXRayMode(!xRayMode)}
            style={{ padding: "8px 18px", fontSize: 12, fontWeight: 600, borderRadius: 12, border: "none", cursor: "pointer", background: xRayMode ? "rgba(255,38,185,0.1)" : "rgba(255,255,255,0.04)", color: xRayMode ? "#FF26B9" : "var(--text-secondary)" }}>
            {xRayMode ? <Eye style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} /> : <EyeOff style={{ width: 12, height: 12, display: "inline", verticalAlign: "middle", marginRight: 4 }} />}
            X-Ray
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
          {stagesLabel.map((label, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage === i ? "#BF48FF" : stage > i ? "#30D158" : "var(--elevated)", boxShadow: stage === i ? "0 0 8px rgba(191,72,255,0.6)" : "none", transition: "all 0.3s" }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: stage === i ? "#BF48FF" : stage > i ? "#30D158" : "var(--text-tertiary)" }}>{label}</span>
              {i < stagesLabel.length - 1 && <div style={{ width: 16, height: 1, background: stage > i ? "#30D158" : "var(--elevated)", transition: "background 0.3s" }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
