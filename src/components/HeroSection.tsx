"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Shield, Users, MapPin, Clock } from "lucide-react";
import { useRef } from "react";

const stats = [
  { icon: Users, value: "50,000+", label: "Verified Students" },
  { icon: MapPin, value: "5 km", label: "Hyperlocal Radius" },
  { icon: Shield, value: "100%", label: "Verified Safe Platform" },
  { icon: Clock, value: "<24h", label: "Time to Hire" },
];

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityText = useTransform(scrollY, [0, 300], [1, 0]);
  const yStats = useTransform(scrollY, [0, 500], [0, 50]);
  const opacityStats = useTransform(scrollY, [0, 400], [1, 0.2]);
  
  const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

  return (
    <section
      id="hero"
      ref={containerRef}
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      {/* Zero-G ambient glow */}
      <div className="float-zero-g" style={{
        position: "absolute", top: "10%", left: "30%", width: "40vw", height: "40vw",
        background: "radial-gradient(circle, rgba(41,151,255,0.15) 0%, transparent 70%)",
        filter: "blur(100px)",
        pointerEvents: "none",
      }} />
      <div className="float-zero-g" style={{
        position: "absolute", top: "40%", right: "20%", width: "50vw", height: "50vw",
        background: "radial-gradient(circle, rgba(191,72,255,0.1) 0%, transparent 70%)",
        filter: "blur(120px)",
        pointerEvents: "none",
        animationDelay: "-2s",
      }} />

      {/* Content */}
      <motion.div style={{ y: yText, opacity: opacityText, position: "relative", zIndex: 10, maxWidth: 1000, margin: "0 auto", padding: "0 24px", textAlign: "center", marginTop: 80 }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 18px", borderRadius: 999,
            marginBottom: 40,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#30D158", boxShadow: "0 0 10px rgba(48,209,88,0.6)", animation: "pulse-ring 2s infinite" }} />
          <span className="label-caps" style={{ color: "var(--text-secondary)" }}>
            Confidential Partnership Proposal
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ...spring }}
          className="heading-hero"
          style={{ fontSize: "clamp(48px, 8vw, 84px)", marginBottom: 32 }}
        >
          <span style={{ color: "var(--text-primary)" }}>StudGoo at Scale.</span>
          <br />
          <span className="aurora-text-gradient">Autonomous Vetting.</span>
          <br />
          <span style={{ color: "var(--text-tertiary)" }}>Zero Telecom Bloat.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="body-large"
          style={{ fontSize: "clamp(18px, 2.5vw, 22px)", maxWidth: 720, margin: "0 auto 52px" }}
        >
          Replace manual dialing, one-by-one screening, and exposed phone numbers
          with an <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>autonomous AI engine</span> that vets, matches, and routes — all within your 5 km radius.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 80 }}
        >
          <a
            href="#simulations"
            className="aurora-gradient elevation-2"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "18px 40px", fontSize: 16, fontWeight: 700,
              color: "white", textDecoration: "none",
              borderRadius: 999,
              transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(41,151,255,0.6)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px var(--glass-shadow), 0 0 1px rgba(255,255,255,0.06)"; }}
          >
            Experience Live Simulations
            <ArrowDown style={{ width: 18, height: 18 }} />
          </a>
          <a
            href="#problems"
            className="glass"
            style={{
              padding: "18px 40px", fontSize: 16, fontWeight: 600,
              color: "var(--text-primary)", textDecoration: "none",
              borderRadius: 999,
              transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--glass-bg)"; }}
          >
            View the Problem
          </a>
        </motion.div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        style={{ y: yStats, opacity: opacityStats, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, width: "100%", maxWidth: 1000, padding: "0 24px", margin: "0 auto", zIndex: 10 }}
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 + i * 0.1, ...spring }}
            className="glass-card"
            style={{
              padding: "24px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <stat.icon style={{ width: 24, height: 24, color: "#2997FF", marginBottom: 12 }} />
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>{stat.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginTop: 4 }}>{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)" }}
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          <ArrowDown style={{ width: 20, height: 20, color: "var(--text-tertiary)" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
