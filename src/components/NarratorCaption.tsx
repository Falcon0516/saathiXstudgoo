"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic } from "lucide-react";

interface NarratorCaptionProps {
  text: string;
  isPlaying: boolean;
  accentColor?: string;
  visible: boolean;
}

export default function NarratorCaption({ 
  text, 
  isPlaying, 
  accentColor = "#FF26B9", 
  visible 
}: NarratorCaptionProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.4, type: "spring", damping: 25, stiffness: 200 }}
          className="narrator-caption elevation-2"
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            width: "90%",
            maxWidth: 600,
            zIndex: 50,
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
          }}
        >
          {/* Avatar / Indicator */}
          <div style={{
            width: 36, height: 36, borderRadius: 12, flexShrink: 0,
            background: `${accentColor}20`,
            border: `1px solid ${accentColor}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Mic style={{ width: 16, height: 16, color: accentColor }} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", 
              color: accentColor, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 
            }}>
              Saathi Explainer
              {isPlaying && (
                <div style={{ display: "flex", alignItems: "center", gap: 2, height: 10 }}>
                  {[...Array(4)].map((_, i) => (
                    <span 
                      key={i} 
                      className="waveform-bar" 
                      style={{ background: accentColor, height: "100%", width: 2, animationDuration: `${0.5 + i * 0.1}s` }} 
                    />
                  ))}
                </div>
              )}
            </div>
            <p style={{ 
              fontSize: 14, lineHeight: 1.6, color: "var(--text-primary)", 
              margin: 0, fontWeight: 500 
            }}>
              "{text}"
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
