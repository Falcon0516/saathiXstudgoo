"use client";

import { motion } from "framer-motion";
import { Zap, Shield, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{ position: "relative", padding: "100px 0 60px", overflow: "hidden", background: "var(--bg)" }}>
      {/* Zero-G Ambient */}
      <div className="float-zero-g" style={{
        position: "absolute", bottom: "-20%", left: "50%", transform: "translateX(-50%)",
        width: "60vw", height: "40vw", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(41,151,255,0.06), transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1000, margin: "0 auto", padding: "0 24px" }}>
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 80 }}
        >
          <div className="glass aurora-border" style={{
            padding: "80px 40px", borderRadius: 40, position: "relative", overflow: "hidden",
            boxShadow: "0 20px 80px rgba(0,0,0,0.5)",
          }}>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, color: "var(--text-primary)", marginBottom: 24, position: "relative", letterSpacing: "-0.03em" }}>
              Ready to Eliminate the <span className="aurora-text-gradient">Bottleneck?</span>
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: 48, maxWidth: 600, margin: "0 auto 48px", fontSize: 18, lineHeight: 1.7, position: "relative" }}>
              Let&apos;s deploy Saathi on your next 50 job matches — free. If we don&apos;t cut your screening time by 90%, you pay nothing.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 16, position: "relative" }}>
              <a href="#hero" className="aurora-gradient" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "18px 40px", fontSize: 16, fontWeight: 700,
                color: "white", textDecoration: "none",
                borderRadius: 999, boxShadow: "0 8px 30px rgba(41,151,255,0.4)",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(41,151,255,0.6)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(41,151,255,0.4)"; }}
              >
                Schedule Pilot Discussion
                <ArrowUpRight style={{ width: 18, height: 18 }} />
              </a>
              <a href="#simulations" className="glass" style={{
                padding: "18px 40px", fontSize: 16, fontWeight: 600,
                color: "var(--text-primary)", textDecoration: "none",
                borderRadius: 999, transition: "all 0.3s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--glass-bg)"; }}
              >
                Replay Simulations
              </a>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
          gap: 20, paddingTop: 40, borderTop: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="aurora-gradient" style={{
              width: 36, height: 36, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(41,151,255,0.3)",
            }}>
              <Zap style={{ width: 16, height: 16, color: "white" }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Saathi</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>× StudGoo</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
            <Shield style={{ width: 14, height: 14, color: "#30D158" }} />
            Confidential — For internal review only
          </div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>
            © {new Date().getFullYear()} Saathi — Proprietary &amp; Confidential
          </div>
        </div>
      </div>
    </footer>
  );
}
