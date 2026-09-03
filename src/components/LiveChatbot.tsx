"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX,
  Bot, User, Loader2, Minimize2,
} from "lucide-react";
import { speakWithSarvam, stopSarvamAudio } from "@/lib/tts";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const spring = { type: "spring" as const, damping: 25, stiffness: 350 };

export default function LiveChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm Saathi, StudGoo's AI agent. Ask me anything about how I automate hyperlocal hiring, mask calls, or manage 24/7 support. Try: \"How do you screen candidates?\"",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speakResponse = useCallback(async (text: string) => {
    if (!ttsEnabled) return;
    setIsSpeaking(true);
    const audio = await speakWithSarvam({
      text,
      language_code: "en-IN",
      speaker: "kavya",
      pace: 1.05,
    });
    if (audio) {
      audio.onended = () => setIsSpeaking(false);
    } else {
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  }, [ttsEnabled]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    stopSarvamAudio();
    setIsSpeaking(false);

    const userMsg: Message = { role: "user", content: trimmed, timestamp: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          stream: false,
        }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const data = await res.json();
      const assistantContent = data.choices?.[0]?.message?.content || "I couldn't process that. Please try again.";

      const assistantMsg: Message = { role: "assistant", content: assistantContent, timestamp: Date.now() };
      setMessages((prev) => [...prev, assistantMsg]);
      speakResponse(assistantContent);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again.", timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating Trigger ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => setIsOpen(true)}
            className="aurora-gradient"
            style={{
              position: "fixed", bottom: 28, right: 28, zIndex: 100,
              width: 64, height: 64, borderRadius: 20, border: "none",
              boxShadow: "0 8px 30px rgba(41,151,255,0.4), 0 0 60px rgba(41,151,255,0.15)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <MessageCircle style={{ width: 26, height: 26, color: "white" }} />
            <div style={{
              position: "absolute", inset: -4, borderRadius: 24, border: "2px solid rgba(41,151,255,0.3)",
              animation: "pulse-ring 2s infinite",
            }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={spring}
            className="elevation-3"
            style={{
              position: "fixed", bottom: 28, right: 28, zIndex: 100,
              width: 400, maxWidth: "calc(100vw - 56px)", height: 580, maxHeight: "calc(100vh - 56px)",
              borderRadius: 28, overflow: "hidden",
              background: "var(--surface)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(40px) saturate(180%)",
              display: "flex", flexDirection: "column",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "18px 20px", borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "var(--glass-bg)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="aurora-gradient" style={{
                  width: 38, height: 38, borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(41,151,255,0.3)",
                }}>
                  <Bot style={{ width: 18, height: 18, color: "white" }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Saathi AI</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#30D158" }} />
                    <span style={{ fontSize: 10, color: "#30D158" }}>
                      {isSpeaking ? "Speaking..." : "Online"}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => { setTtsEnabled(!ttsEnabled); if (ttsEnabled) stopSarvamAudio(); }}
                  style={{
                    width: 32, height: 32, borderRadius: 10, border: "none",
                    background: ttsEnabled ? "rgba(41,151,255,0.15)" : "rgba(255,255,255,0.05)",
                    color: ttsEnabled ? "#2997FF" : "var(--text-tertiary)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  {ttsEnabled ? <Volume2 style={{ width: 14, height: 14 }} /> : <VolumeX style={{ width: 14, height: 14 }} />}
                </button>
                <button
                  onClick={() => { setIsOpen(false); stopSarvamAudio(); }}
                  style={{
                    width: 32, height: 32, borderRadius: 10, border: "none",
                    background: "rgba(255,255,255,0.05)", color: "var(--text-tertiary)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <Minimize2 style={{ width: 14, height: 14 }} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{
              flex: 1, overflowY: "auto", padding: "16px 16px",
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: "flex", gap: 10,
                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                    alignItems: "flex-end",
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 10, flexShrink: 0,
                    background: msg.role === "assistant"
                      ? "linear-gradient(135deg, #2997FF, #BF48FF)"
                      : "rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {msg.role === "assistant"
                      ? <Bot style={{ width: 13, height: 13, color: "white" }} />
                      : <User style={{ width: 13, height: 13, color: "var(--text-secondary)" }} />
                    }
                  </div>
                  <div style={{
                    maxWidth: "78%", padding: "12px 16px", borderRadius: 18,
                    background: msg.role === "assistant"
                      ? "var(--glass-bg)"
                      : "linear-gradient(135deg, #2997FF, #BF48FF)",
                    border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                    borderBottomLeftRadius: msg.role === "assistant" ? 6 : 18,
                    borderBottomRightRadius: msg.role === "user" ? 6 : 18,
                  }}>
                    <p style={{
                      fontSize: 13, lineHeight: 1.6, margin: 0,
                      color: msg.role === "assistant" ? "var(--text-primary)" : "white",
                    }}>
                      {msg.content}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
                >
                  <div className="aurora-gradient" style={{
                    width: 28, height: 28, borderRadius: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Bot style={{ width: 13, height: 13, color: "white" }} />
                  </div>
                  <div style={{
                    padding: "14px 20px", borderRadius: 18, borderBottomLeftRadius: 6,
                    background: "var(--glass-bg)",
                    border: "1px solid var(--border)",
                    display: "flex", gap: 5,
                  }}>
                    {[0, 1, 2].map((d) => (
                      <motion.div
                        key={d}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }}
                        style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-tertiary)" }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div style={{
              padding: "14px 16px", borderTop: "1px solid var(--border)",
              background: "var(--glass-bg)",
            }}>
              {/* Waveform when speaking */}
              {isSpeaking && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: 24, marginBottom: 10, gap: 2,
                }}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className="waveform-bar" style={{ background: "#2997FF" }} />
                  ))}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Mic button */}
                {recognitionRef.current && (
                  <button
                    onClick={toggleListening}
                    style={{
                      width: 38, height: 38, borderRadius: 12, border: "none",
                      background: isListening ? "rgba(255,69,58,0.2)" : "rgba(255,255,255,0.05)",
                      color: isListening ? "#FF453A" : "var(--text-tertiary)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                    }}
                  >
                    {isListening
                      ? <MicOff style={{ width: 16, height: 16 }} />
                      : <Mic style={{ width: 16, height: 16 }} />
                    }
                  </button>
                )}
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Saathi anything..."
                  style={{
                    flex: 1, padding: "10px 16px", borderRadius: 14, border: "none",
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text-primary)", fontSize: 13, outline: "none",
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className={input.trim() ? "aurora-gradient" : ""}
                  style={{
                    width: 38, height: 38, borderRadius: 12, border: "none",
                    background: input.trim() ? undefined : "rgba(255,255,255,0.05)",
                    color: input.trim() ? "white" : "var(--text-tertiary)",
                    cursor: input.trim() ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, opacity: isLoading ? 0.5 : 1,
                    transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  {isLoading
                    ? <Loader2 style={{ width: 16, height: 16, animation: "spin 0.8s linear infinite" }} />
                    : <Send style={{ width: 16, height: 16 }} />
                  }
                </button>
              </div>
              <div style={{ textAlign: "center", marginTop: 8 }}>
                <span style={{ fontSize: 9, color: "var(--text-tertiary)" }}>
                  Powered by Saathi Cognitive Engine • Sarvam Voice
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
