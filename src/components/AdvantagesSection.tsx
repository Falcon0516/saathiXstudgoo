"use client";

import { motion } from "framer-motion";
import {
  Zap, TrendingDown, Clock, BarChart3, ArrowRight,
  CheckCircle2, Calendar
} from "lucide-react";

const advantages = [
  { icon: Zap, title: "Speed to Fulfillment", stat: "8 min", statBefore: "18 hrs", desc: "Compress time-to-hire from hours of manual dialing to minutes of autonomous AI screening.", color: "#2997FF", className: "md:col-span-2 md:row-span-1" },
  { icon: TrendingDown, title: "Cost Efficiency", stat: "90%", statLabel: "Cost Reduction", desc: "Replace call-center overhead with scalable AI infrastructure at near-zero marginal cost.", color: "#30D158", className: "md:col-span-1 md:row-span-2" },
  { icon: Clock, title: "Always-On Support", stat: "24/7", statLabel: "Autonomous Triage", desc: "Voice AI handles routine queries — payouts, arrivals, verification — escalating only edge cases.", color: "#BF48FF", className: "md:col-span-1 md:row-span-1" },
  { icon: BarChart3, title: "Data-Driven Matching", stat: "97%+", statLabel: "Match Accuracy", desc: "Standardize candidate quality through AI scoring rather than subjective manual vetting.", color: "#FF9F0A", className: "md:col-span-1 md:row-span-1" },
];

const economics = [
  { metric: "Time to Hire", before: "18 hours", after: "8 minutes", improvement: "135x faster" },
  { metric: "Manual Calls / Job", before: "15–20 calls", after: "0 calls", improvement: "100% eliminated" },
  { metric: "Telecom Cost / Month", before: "₹15,000+", after: "Included in SaaS", improvement: "~90% savings" },
  { metric: "Platform Leakage", before: "30–40%", after: "0%", improvement: "100% retained" },
  { metric: "Support Staff Needed", before: "2–3 FTEs", after: "0 (AI triage)", improvement: "100% automated" },
  { metric: "Screening Capacity", before: "5 jobs/day", after: "Unlimited", improvement: "∞ scalable" },
];

const timeline = [
  { week: "Week 1", title: "Data Handshake & Ingestion", tasks: ["Form triggers synced", "Candidate table connected", "Messaging template approval"], color: "#2997FF" },
  { week: "Week 2", title: "Screening Engine & Voice Tuning", tasks: ["Conversational logic for 11 job categories", "5 km radius scoring active", "Language tuning (EN/HI/KN)"], color: "#BF48FF" },
  { week: "Week 3", title: "Telephony Proxy & Masked Bridge", tasks: ["Virtual caller pools provisioned", "Bidirectional number masking live", "Call recording & transcription"], color: "#30D158" },
  { week: "Week 4", title: "Shadow Pilot & Go-Live", tasks: ["50 live job matches in shadow mode", "End-to-end masked calls verified", "Full commercial deployment"], color: "#FF9F0A" },
];

const partnerships = [
  {
    title: "Starter Pack",
    subtitle: "Pay-Per-Call",
    tagline: "Usage-Based Billing",
    highlight: "Per Call",
    description: "Pay only for what you use — billed per successful AI call.",
    features: ["No minimum commitment", "Full masked call routing", "Real-time dashboard access", "Ideal for pilot programs"],
    recommended: false,
    icon: "📞",
  },
  {
    title: "Growth Plan",
    subtitle: "Subscription",
    tagline: "Most Popular",
    highlight: "100 calls/day",
    description: "Fixed daily quota with rollover. Scale as you grow.",
    features: ["100 calls/day or 1,000/week", "Priority candidate matching", "Dedicated account manager", "Volume discounts on overages"],
    recommended: true,
    icon: "🚀",
  },
  {
    title: "Enterprise",
    subtitle: "Unlimited",
    tagline: "Full Scale",
    highlight: "Unlimited",
    description: "Unlimited calls per day, week, or month — no caps.",
    features: ["Unlimited AI calls", "Custom SLA & uptime guarantee", "White-label option available", "Dedicated infra & priority routing"],
    recommended: false,
    icon: "🏢",
  },
];

const spring = { type: "spring" as const, damping: 20, stiffness: 100 };

export default function AdvantagesSection() {
  return (
    <section id="advantages" style={{ position: "relative", padding: "120px 0", overflow: "hidden", background: "var(--bg)" }}>
      {/* Zero-G ambient */}
      <div className="float-zero-g" style={{ position: "absolute", top: "20%", left: "-10%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(48,209,88,0.05) 0%, transparent 70%)", filter: "blur(80px)" }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ...spring }} style={{ textAlign: "center", marginBottom: 64 }}>
          <span className="label-caps" style={{ color: "#30D158", display: "block", marginBottom: 16 }}>Advantages</span>
          <h2 className="heading-section" style={{ marginBottom: 20 }}>The Competitive Edge</h2>
          <p className="body-large" style={{ maxWidth: 640, margin: "0 auto" }}>
            Quantifiable operational gains transforming StudGoo from a manual staffing agency into a tech-enabled autonomous marketplace.
          </p>
        </motion.div>

        {/* ── Asymmetrical Bento Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-24">
          {advantages.map((adv, i) => (
            <motion.div key={adv.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.1, ...spring }}
              className={`glass ${adv.className}`}
              style={{
                padding: 32, borderRadius: 28,
                display: "flex", flexDirection: "column",
                transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                cursor: "default",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 16, background: `${adv.color}15`, border: `1px solid ${adv.color}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "auto", minHeight: 48 }}>
                <adv.icon style={{ width: 22, height: 22, color: adv.color }} />
              </div>
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: adv.color, letterSpacing: "-0.03em", marginBottom: 4 }}>{adv.stat}</div>
                {adv.statBefore && (
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ textDecoration: "line-through", color: "#FF453A" }}>{adv.statBefore}</span>
                    <ArrowRight style={{ width: 12, height: 12, color: "var(--text-tertiary)" }} />
                    <span style={{ color: "#30D158" }}>{adv.stat}</span>
                  </div>
                )}
                {adv.statLabel && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>{adv.statLabel}</div>}
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>{adv.title}</h4>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{adv.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Unit Economics Table ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ...spring }} style={{ marginBottom: 100 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h3 className="heading-section" style={{ fontSize: "clamp(22px, 3vw, 36px)", marginBottom: 12 }}>Unit Economics — Before vs After</h3>
            <p className="body-large">Concrete ROI metrics proving the cost-to-value transformation.</p>
          </div>

          <div className="glass" style={{ borderRadius: 28, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
                    {["Metric", "Before (Manual)", "After (Saathi)", "Improvement"].map((h, i) => (
                      <th key={h} className="label-caps" style={{
                        padding: "20px 24px",
                        color: i === 1 ? "#FF453A" : i === 2 ? "#30D158" : i === 3 ? "#2997FF" : "var(--text-secondary)",
                        textAlign: i === 0 ? "left" : "center",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {economics.map((row) => (
                    <tr key={row.metric} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={{ padding: "18px 24px", color: "var(--text-primary)", fontWeight: 600 }}>{row.metric}</td>
                      <td style={{ padding: "18px 24px", textAlign: "center", color: "#FF453A" }}>{row.before}</td>
                      <td style={{ padding: "18px 24px", textAlign: "center", color: "#30D158", fontWeight: 600 }}>{row.after}</td>
                      <td style={{ padding: "18px 24px", textAlign: "center" }}>
                        <span style={{
                          padding: "6px 16px", borderRadius: 999,
                          background: "rgba(41,151,255,0.1)", color: "#2997FF",
                          fontSize: 12, fontWeight: 600,
                        }}>{row.improvement}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* ── 30-Day Rollout ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ...spring }} style={{ marginBottom: 100 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h3 className="heading-section" style={{ fontSize: "clamp(22px, 3vw, 36px)", marginBottom: 12 }}>30-Day Zero-Disruption Rollout</h3>
            <p className="body-large">Incremental deployment without taking down your current workflow.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {timeline.map((phase, i) => (
              <motion.div key={phase.week} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5, ...spring }}
                className="glass"
                style={{ padding: 28, borderRadius: 24, transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)" }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 16px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                  background: `${phase.color}15`, color: phase.color, marginBottom: 20,
                }}>
                  <Calendar style={{ width: 12, height: 12 }} />
                  {phase.week}
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>{phase.title}</h4>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12, margin: 0 }}>
                  {phase.tasks.map((task) => (
                    <li key={task} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "var(--text-secondary)" }}>
                      <CheckCircle2 style={{ width: 16, height: 16, color: phase.color, flexShrink: 0, marginTop: 1 }} />
                      {task}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Partnership Models ── */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ...spring }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h3 className="heading-section" style={{ fontSize: "clamp(22px, 3vw, 36px)", marginBottom: 12 }}>Flexible Partnership Models</h3>
            <p className="body-large" style={{ color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto" }}>Choose the structure that aligns with your growth stage — like picking a mobile plan.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
            {partnerships.map((plan, i) => (
              <motion.div key={plan.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5, ...spring }}
                className={plan.recommended ? "glass aurora-border" : "glass"}
                style={{
                  padding: 40, borderRadius: 32, position: "relative",
                  transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
                  background: plan.recommended ? "var(--surface)" : "var(--glass-bg)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-6px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {plan.recommended && (
                  <div className="aurora-gradient" style={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    padding: "6px 20px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                    color: "white", boxShadow: "0 4px 12px rgba(41,151,255,0.3)",
                  }}>
                    {plan.tagline}
                  </div>
                )}
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{plan.icon}</div>
                  <h4 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{plan.title}</h4>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{plan.subtitle}</p>
                  <div style={{ marginTop: 20, padding: "10px 24px", borderRadius: 999, display: "inline-block", background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.15)" }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: "#0EA5E9", letterSpacing: "-0.02em" }}>{plan.highlight}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 12, lineHeight: 1.5 }}>{plan.description}</p>
                </div>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 14, margin: 0 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>
                      <CheckCircle2 style={{ width: 16, height: 16, color: "#30D158", flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
          {/* ── Flexible Add-On Packs ── */}
          <div style={{ marginTop: 48, maxWidth: 1000, margin: "48px auto 0" }}>
            <p style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24 }}>
              More Flexible Options
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
              {[
                { label: "Weekly Pack", calls: "500 calls/week", desc: "Great for seasonal demand", icon: "📅" },
                { label: "Monthly Bundle", calls: "5,000 calls/mo", desc: "Best value for steady ops", icon: "📦" },
                { label: "Night Owl", calls: "Unlimited 8PM–8AM", desc: "Off-peak support coverage", icon: "🌙" },
                { label: "Custom Plan", calls: "You decide", desc: "Build your own call quota", icon: "⚙️" },
              ].map((pack) => (
                <motion.div
                  key={pack.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ...spring }}
                  style={{
                    padding: "20px 24px",
                    borderRadius: 20,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", gap: 16,
                    transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(14,165,233,0.35)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{pack.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{pack.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0EA5E9", marginTop: 2 }}>{pack.calls}</div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>{pack.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Disclaimer Note */}
          <p style={{
            textAlign: "center", fontSize: 12, color: "var(--text-tertiary)",
            marginTop: 32, maxWidth: 600, margin: "32px auto 0",
            fontStyle: "italic", lineHeight: 1.6,
          }}>
            * Pricing details shared upon partnership discussion. Plans may include additional service, integration &amp; maintenance fees. Custom plans available on request.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
