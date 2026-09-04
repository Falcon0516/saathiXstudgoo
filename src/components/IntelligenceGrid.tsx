"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

/* ─── Grid config ─── */
const GRID_SPACING = 40;
const DOT_RADIUS = 1.5;
const CURSOR_RADIUS = 140;
const CONNECTION_DIST = 80;
const PARTICLE_COUNT = 25;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

const features = [
  {
    title: "Cursor Interaction",
    desc: "Particles react to your presence. Connections form. Grid nodes light up.",
    emoji: "✦",
  },
  {
    title: "Grid Activation",
    desc: "Nearby grid intersections illuminate with a soft ripple effect.",
    emoji: "◉",
  },
  {
    title: "Ambient Particles",
    desc: "Floating particles create depth and a sense of intelligent motion.",
    emoji: "✧",
  },
];

export default function IntelligenceGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const [isDark, setIsDark] = useState(false);

  // Detect theme
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initParticles(rect.width, rect.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -999, y: -999 };
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Colors
      const dotColor = isDark ? "rgba(100,181,246," : "rgba(14,165,233,";
      const lineColor = isDark ? "rgba(41,151,255," : "rgba(14,165,233,";
      const particleColor = isDark ? "rgba(100,181,246," : "rgba(56,189,248,";
      const glowColor = isDark ? "rgba(41,151,255," : "rgba(14,165,233,";

      // Draw grid dots
      const cols = Math.ceil(w / GRID_SPACING);
      const rows = Math.ceil(h / GRID_SPACING);

      const activeDots: { x: number; y: number; intensity: number }[] = [];

      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          const x = c * GRID_SPACING;
          const y = r * GRID_SPACING;
          const dist = Math.hypot(x - mx, y - my);
          const inRange = dist < CURSOR_RADIUS;
          const intensity = inRange ? 1 - dist / CURSOR_RADIUS : 0;

          const baseAlpha = isDark ? 0.08 : 0.12;
          const alpha = baseAlpha + intensity * (isDark ? 0.7 : 0.6);
          const radius = DOT_RADIUS + intensity * 2.5;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `${dotColor}${alpha})`;
          ctx.fill();

          // Glow on active dots
          if (intensity > 0.3) {
            ctx.beginPath();
            ctx.arc(x, y, radius + 6, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius + 6);
            grad.addColorStop(0, `${glowColor}${intensity * 0.3})`);
            grad.addColorStop(1, `${glowColor}0)`);
            ctx.fillStyle = grad;
            ctx.fill();

            activeDots.push({ x, y, intensity });
          }
        }
      }

      // Draw connections between active dots
      for (let i = 0; i < activeDots.length; i++) {
        for (let j = i + 1; j < activeDots.length; j++) {
          const a = activeDots[i];
          const b = activeDots[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * Math.min(a.intensity, b.intensity) * 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `${lineColor}${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Cursor glow
      if (mx > 0 && my > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, CURSOR_RADIUS * 0.6);
        grad.addColorStop(0, `${glowColor}${isDark ? 0.08 : 0.06})`);
        grad.addColorStop(1, `${glowColor}0)`);
        ctx.beginPath();
        ctx.arc(mx, my, CURSOR_RADIUS * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Ambient particles
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Repel from cursor
        const pdist = Math.hypot(p.x - mx, p.y - my);
        if (pdist < CURSOR_RADIUS * 0.8) {
          const angle = Math.atan2(p.y - my, p.x - mx);
          const force = (1 - pdist / (CURSOR_RADIUS * 0.8)) * 0.5;
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
        }

        // Dampen velocity
        p.vx *= 0.99;
        p.vy *= 0.99;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${particleColor}${p.alpha})`;
        ctx.fill();

        // Connect particles to nearby active dots
        activeDots.forEach((d) => {
          const dd = Math.hypot(p.x - d.x, p.y - d.y);
          if (dd < CONNECTION_DIST * 1.5) {
            const alpha = (1 - dd / (CONNECTION_DIST * 1.5)) * d.intensity * 0.25;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(d.x, d.y);
            ctx.strokeStyle = `${lineColor}${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isDark, initParticles]);

  const spring = { type: "spring" as const, damping: 25, stiffness: 150 };

  return (
    <section
      id="intelligence"
      style={{
        position: "relative",
        padding: "100px 0",
        overflow: "hidden",
        background: isDark
          ? "linear-gradient(180deg, #000000, #050510, #000000)"
          : "linear-gradient(180deg, #EFF8FF, #E0F2FE, #EFF8FF)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.5fr 1fr",
            gap: 32,
            alignItems: "center",
            minHeight: 480,
          }}
        >
          {/* Left — Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ...spring }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 16px",
                borderRadius: 999,
                background: isDark ? "rgba(41,151,255,0.1)" : "rgba(14,165,233,0.08)",
                border: `1px solid ${isDark ? "rgba(41,151,255,0.2)" : "rgba(14,165,233,0.15)"}`,
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: 14 }}>{isDark ? "🌙" : "✦"}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: isDark ? "#64B5F6" : "#0284C7",
                }}
              >
                {isDark ? "Dark Mode" : "Light Mode"}
              </span>
            </div>

            <h2
              style={{
                fontSize: "clamp(28px, 3.5vw, 44px)",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1.1,
                color: "var(--text-primary)",
                marginBottom: 16,
              }}
            >
              Adaptive
              <br />
              Intelligence
              <br />
              Grid
            </h2>

            <p
              className="aurora-text-gradient"
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 12,
              }}
            >
              A living digital canvas.
            </p>

            <p
              style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: 28,
              }}
            >
              Subtle grid. Intelligent particles.
              <br />
              Calm at rest, responsive when touched.
            </p>

            <a
              href="#simulations"
              className="aurora-gradient"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 28px",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 700,
                color: "white",
                textDecoration: "none",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Explore Saathi →
            </a>
          </motion.div>

          {/* Center — Canvas */}
          <div
            ref={containerRef}
            style={{
              position: "relative",
              width: "100%",
              height: 420,
              borderRadius: 24,
              overflow: "hidden",
              cursor: "crosshair",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
              }}
            />
          </div>

          {/* Right — Feature Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5, ...spring }}
                style={{
                  padding: "20px 22px",
                  borderRadius: 20,
                  background: isDark
                    ? "rgba(28,28,30,0.6)"
                    : "rgba(255,255,255,0.85)",
                  border: `1px solid ${isDark ? "rgba(245,245,247,0.06)" : "rgba(14,165,233,0.12)"}`,
                  backdropFilter: "blur(20px)",
                  transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isDark
                    ? "rgba(41,151,255,0.3)"
                    : "rgba(14,165,233,0.35)";
                  e.currentTarget.style.transform = "translateX(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark
                    ? "rgba(245,245,247,0.06)"
                    : "rgba(14,165,233,0.12)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: isDark
                        ? "rgba(41,151,255,0.12)"
                        : "rgba(14,165,233,0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                      color: isDark ? "#64B5F6" : "#0284C7",
                    }}
                  >
                    {f.emoji}
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 4,
                      }}
                    >
                      {f.title}
                    </h4>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        lineHeight: 1.5,
                      }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
