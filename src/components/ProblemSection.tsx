"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { AlertTriangle, PhoneOff, DollarSign, ArrowDown } from "lucide-react";
import { useRef } from "react";

const problems = [
  {
    icon: AlertTriangle, color: "#FF453A",
    title: "Manual Screening Doesn't Scale",
    stat: "5 jobs/day", statLabel: "Maximum capacity with manual calling",
    desc: "Calling candidates one by one caps growth. The \"Hire in 24 Hours\" promise becomes impossible as merchant volume scales.",
  },
  {
    icon: PhoneOff, color: "#FF9F0A",
    title: "Platform Disintermediation",
    stat: "30–40%", statLabel: "Estimated revenue leakage",
    desc: "When merchants and students exchange real phone numbers, they bypass the platform for future shifts — eliminating StudGoo's commission.",
  },
  {
    icon: DollarSign, color: "#BF48FF",
    title: "Telecom & Support Overhead",
    stat: "₹15,000+/mo", statLabel: "Estimated calling costs",
    desc: "Traditional outbound calling and manual support operations erode gig-economy margins before profitability.",
  },
];

const Card = ({ problem, index, progress }: { problem: any, index: number, progress: any }) => {
  // Use framer-motion useTransform to animate cards based on overall section scroll
  // Each card will fade in/out as it scrolls through the viewport
  const start = index * 0.3;
  const end = start + 0.3;
  
  const opacity = useTransform(progress, [Math.max(0, start - 0.1), start, end, end + 0.1], [0, 1, 1, 0]);
  const scale = useTransform(progress, [Math.max(0, start - 0.1), start, end, end + 0.1], [0.9, 1, 1, 0.9]);
  const y = useTransform(progress, [Math.max(0, start - 0.1), start, end, end + 0.1], [50, 0, 0, -50]);

  return (
    <motion.div
      style={{
        opacity, scale, y,
        position: index === 0 ? "relative" : "absolute",
        top: 0, left: 0, right: 0,
        padding: 40, borderRadius: 32,
        background: "var(--glass-bg)",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.3)",
      }}
      className="glass aurora-border"
    >
      <div style={{
        width: 64, height: 64, borderRadius: 20,
        background: `${problem.color}15`, border: `1px solid ${problem.color}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 32,
      }}>
        <problem.icon style={{ width: 28, height: 28, color: problem.color }} />
      </div>
      <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", marginBottom: 20, letterSpacing: "-0.02em" }}>{problem.title}</h3>
      <div style={{
        padding: 24, borderRadius: 20,
        background: "var(--surface)", border: "1px solid var(--border)",
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: problem.color, letterSpacing: "-0.02em" }}>{problem.stat}</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600 }}>{problem.statLabel}</div>
      </div>
      <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{problem.desc}</p>
    </motion.div>
  );
};

export default function ProblemSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  return (
    <section id="problems" ref={containerRef} style={{
      position: "relative",
      padding: "0", 
      background: "var(--bg)",
      // We make the section very tall so the user has to scroll through it
      height: "300vh", 
    }}>
      {/* Sticky Container */}
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}>
        {/* Zero-G ambient */}
        <div className="float-zero-g" style={{
          position: "absolute", top: "20%", right: "-10%", width: "50vw", height: "50vw",
          background: "radial-gradient(circle, rgba(255,69,58,0.05) 0%, transparent 70%)",
          filter: "blur(100px)",
        }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", width: "100%" }}>
          <div className="md:grid md:grid-cols-2 md:gap-16 items-center">
            {/* Left side: Sticky Content */}
            <div style={{ marginBottom: "64px" }} className="md:mb-0">
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#FF453A", display: "block", marginBottom: 16 }}>
                Problem Solving
              </span>
              <h2 style={{ fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text-primary)", marginBottom: 24, lineHeight: 1.1 }}>
                The Bottlenecks Capping{" "}
                <span className="aurora-text-gradient">Growth</span>
              </h2>
              <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 500, lineHeight: 1.7, marginBottom: 40 }}>
                Three operational risks preventing scale from 5 jobs/day to 5,000 — and exactly how the Saathi engine eliminates each one autonomously.
              </p>
              
              <a
                href="#simulations"
                className="glass"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  padding: "16px 32px", fontSize: 14, fontWeight: 700,
                  color: "var(--text-primary)", textDecoration: "none",
                  borderRadius: 999, transition: "all 0.3s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--glass-bg)"; }}
              >
                Launch Interactive Simulations
                <ArrowDown style={{ width: 16, height: 16 }} />
              </a>
            </div>

            {/* Right side: Scrollytelling Cards */}
            <div style={{ position: "relative", minHeight: 400, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {problems.map((problem, i) => (
                <Card key={problem.title} problem={problem} index={i} progress={scrollYProgress} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
