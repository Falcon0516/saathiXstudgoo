"use client";

import { useRef, useEffect, useState } from "react";

/* ─── Config ─── */
const GRID_SPACING = 48;
const DOT_BASE_RADIUS = 1.2;
const CURSOR_RADIUS = 150;
const CONNECTION_DIST = 85;
const PARTICLE_COUNT = 12;
const FLOW_STRENGTH = 10;

interface Particle {
  x: number; y: number; vx: number; vy: number; r: number; alpha: number;
}

export default function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Init particles for viewport only
      const particles: Particle[] = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
          r: Math.random() * 1.5 + 0.8, alpha: Math.random() * 0.3 + 0.1,
        });
      }
      particlesRef.current = particles;
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -999, y: -999 };
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Persistent displacement map for smooth spring-back
    const displacements = new Map<string, { dx: number; dy: number }>();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const scrollY = window.scrollY;

      // Theme colors
      const dotCol = isDark ? "rgba(100,181,246," : "rgba(14,165,233,";
      const lineCol = isDark ? "rgba(41,151,255," : "rgba(14,165,233,";
      const glowCol = isDark ? "rgba(41,151,255," : "rgba(14,165,233,";
      const pCol = isDark ? "rgba(100,181,246," : "rgba(56,189,248,";

      const activeDots: { x: number; y: number; intensity: number }[] = [];

      // Calculate grid offset so dots scroll with page
      const offsetY = -(scrollY % GRID_SPACING);
      const cols = Math.ceil(w / GRID_SPACING) + 1;
      const rows = Math.ceil(h / GRID_SPACING) + 2;

      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          const ox = c * GRID_SPACING;
          const oy = r * GRID_SPACING + offsetY;

          if (oy < -GRID_SPACING || oy > h + GRID_SPACING) continue;

          const key = `${c}_${r}`;
          let disp = displacements.get(key);
          if (!disp) { disp = { dx: 0, dy: 0 }; displacements.set(key, disp); }

          const dist = Math.hypot(ox - mx, oy - my);
          const inRange = dist < CURSOR_RADIUS;
          const intensity = inRange ? 1 - dist / CURSOR_RADIUS : 0;

          // Flow displacement
          if (inRange && dist > 1) {
            const angle = Math.atan2(oy - my, ox - mx);
            const target = intensity * intensity * FLOW_STRENGTH;
            disp.dx += (Math.cos(angle) * target - disp.dx) * 0.15;
            disp.dy += (Math.sin(angle) * target - disp.dy) * 0.15;
          } else {
            disp.dx *= 0.9;
            disp.dy *= 0.9;
          }

          const x = ox + disp.dx;
          const y = oy + disp.dy;

          const baseAlpha = isDark ? 0.05 : 0.08;
          const alpha = baseAlpha + intensity * (isDark ? 0.55 : 0.45);
          const radius = DOT_BASE_RADIUS + intensity * 2;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `${dotCol}${alpha})`;
          ctx.fill();

          if (intensity > 0.3) {
            ctx.beginPath();
            ctx.arc(x, y, radius + 4, 0, Math.PI * 2);
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius + 4);
            grad.addColorStop(0, `${glowCol}${intensity * 0.2})`);
            grad.addColorStop(1, `${glowCol}0)`);
            ctx.fillStyle = grad;
            ctx.fill();
            activeDots.push({ x, y, intensity });
          }
        }
      }

      // Connections
      for (let i = 0; i < activeDots.length; i++) {
        for (let j = i + 1; j < activeDots.length; j++) {
          const a = activeDots[i], b = activeDots[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < CONNECTION_DIST) {
            const alpha = (1 - d / CONNECTION_DIST) * Math.min(a.intensity, b.intensity) * 0.4;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `${lineCol}${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Cursor glow
      if (mx > 0 && my > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, CURSOR_RADIUS * 0.4);
        grad.addColorStop(0, `${glowCol}${isDark ? 0.05 : 0.035})`);
        grad.addColorStop(1, `${glowCol}0)`);
        ctx.beginPath();
        ctx.arc(mx, my, CURSOR_RADIUS * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Particles
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const pdist = Math.hypot(p.x - mx, p.y - my);
        if (pdist < CURSOR_RADIUS * 0.6) {
          const angle = Math.atan2(p.y - my, p.x - mx);
          p.vx += Math.cos(angle) * 0.15;
          p.vy += Math.sin(angle) * 0.15;
        }
        p.vx *= 0.99;
        p.vy *= 0.99;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${pCol}${p.alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
