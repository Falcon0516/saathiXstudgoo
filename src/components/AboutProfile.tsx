"use client";

import { motion } from "framer-motion";
import {
  Briefcase, UserCheck, Phone, MapPin, Star, CheckCircle2,
  ArrowRight, Zap, ShieldCheck, Clock,
} from "lucide-react";

const studentFlow = [
  { icon: Phone, label: "Sign Up", desc: "Student registers on platform" },
  { icon: UserCheck, label: "Profile Verified", desc: "Identity & skills checked" },
  { icon: MapPin, label: "Location Set", desc: "5 km radius configured" },
  { icon: Briefcase, label: "Job Matched", desc: "Shift allocated by founder" },
  { icon: Star, label: "Complete Shift", desc: "Work performed on-site" },
  { icon: CheckCircle2, label: "Get Paid", desc: "Weekly payout via platform" },
];

const businessFlow = [
  { icon: Briefcase, label: "Post Requirement", desc: "Role, timing, location" },
  { icon: Phone, label: "Manual Calls", desc: "Founder dials candidates" },
  { icon: UserCheck, label: "Screen & Match", desc: "Subjective vetting" },
  { icon: CheckCircle2, label: "Hire & Pay", desc: "Shift confirmed" },
];

const saathiCapabilities = [
  { icon: Zap, title: "Autonomous Outreach", desc: "Parallel dialing of the entire candidate pool — zero manual calls.", color: "#2997FF" },
  { icon: ShieldCheck, title: "Masked Routing Bridge", desc: "All communication flows through secure proxy numbers. No data leaks.", color: "#BF48FF" },
  { icon: MapPin, title: "Geo-Radius Enforcement", desc: "Programmatic 5 km verification using live GPS coordinates.", color: "#30D158" },
  { icon: Star, title: "AI Competency Scoring", desc: "Conversational screening assigns a composite match index per candidate.", color: "#FF9F0A" },
  { icon: Clock, title: "24/7 Voice Support", desc: "Frontline triage for merchant & student queries without human operators.", color: "#FF453A" },
];

function FlowCard({ title, subtitle, steps, accentColor }: { title: string; subtitle: string; steps: typeof studentFlow; accentColor: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="glass"
      style={{
        padding: 36,
        borderRadius: 28,
        transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <h3 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6, letterSpacing: "-0.01em" }}>{title}</h3>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 32 }}>{subtitle}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            style={{ display: "flex", alignItems: "center", gap: 16 }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 16, flexShrink: 0,
              background: `${accentColor}15`, border: `1px solid ${accentColor}25`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <step.icon style={{ width: 20, height: 20, color: accentColor }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{step.label}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{step.desc}</div>
            </div>
            {i < steps.length - 1 && <ArrowRight style={{ width: 14, height: 14, color: "var(--elevated)", flexShrink: 0 }} />}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function AboutProfile() {
  return (
    <section id="about" style={{
      position: "relative", padding: "120px 0", overflow: "hidden",
      background: "var(--bg)",
    }}>
      {/* Zero-G ambient */}
      <div className="float-zero-g" style={{
        position: "absolute", top: "10%", right: "-10%", width: "40vw", height: "40vw",
        background: "radial-gradient(circle, rgba(191,72,255,0.06) 0%, transparent 70%)",
        filter: "blur(100px)",
      }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 80 }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#BF48FF", display: "block", marginBottom: 16 }}>
            About Profile
          </span>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text-primary)", marginBottom: 24, lineHeight: 1.1 }}>
            The Core <span className="aurora-text-gradient">Orchestration Engine</span>
          </h2>
          <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
            Saathi maps directly onto StudGoo&apos;s existing workflows — sitting invisibly in the middle, executing the heavy lifting of calling, scoring, and matching.
          </p>
        </motion.div>

        {/* Workflow Diagrams */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 32, marginBottom: 100 }}>
          <FlowCard title="Student Journey" subtitle="6-step flow from sign-up to payout" steps={studentFlow} accentColor="#2997FF" />
          <div>
            <FlowCard title="Business Journey" subtitle="4-step flow from posting to hire" steps={businessFlow} accentColor="#BF48FF" />
            {/* Bottleneck callout */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              style={{
                marginTop: 24, padding: 24, borderRadius: 24,
                border: "1px solid rgba(255,69,58,0.3)", background: "rgba(255,69,58,0.08)",
                boxShadow: "0 8px 30px rgba(255,69,58,0.1)",
              }}
            >
              <p style={{ fontSize: 14, color: "#FF453A", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <Zap style={{ width: 16, height: 16 }} />
                Current Bottleneck
              </p>
              <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6, margin: 0 }}>
                Step 2 &amp; 3 are entirely manual — the founder spends 4+ hours/day dialing and screening candidates one by one.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Saathi Capabilities */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          <h3 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "var(--text-primary)", marginBottom: 16 }}>
            Where Saathi Steps In
          </h3>
          <p style={{ color: "var(--text-secondary)", maxWidth: 540, margin: "0 auto", fontSize: 16 }}>
            Five autonomous capabilities that replace manual mediation entirely.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
          {saathiCapabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass"
              style={{
                padding: 32, borderRadius: 24, textAlign: "center",
                transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)", cursor: "default",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 18, margin: "0 auto 20px",
                background: `linear-gradient(135deg, ${cap.color}15, ${cap.color}05)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <cap.icon style={{ width: 26, height: 26, color: cap.color }} />
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", marginBottom: 10 }}>{cap.title}</h4>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{cap.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
