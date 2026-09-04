"use client";

import { useRef, useEffect, useState, useCallback } from "react";

/* ─── Config ─── */
const GRID_SPACING = 44;
const DOT_BASE_RADIUS = 1.2;
const CURSOR_RADIUS = 160;
const CONNECTION_DIST = 90;
const PARTICLE_COUNT = 20;
const FLOW_STRENGTH = 12; // How far dots displace

interface GridDot {
  ox: number; // original x
  oy: number; // original y
  x: number;  // current x (displaced)
  y: number;  // current y (displaced)
}

interface Particle {
  x: number; y: number; vx: number; vy: number; r: number; alpha: number;
}

export default function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const dotsRef = useRef<GridDot[]>([]);
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

  const buildGrid = useCallback((w: number, h: number) => {
    const dots: GridDot[] = [];
    const cols = Math.ceil(w / GRID_SPACING) + 1;
    const rows = Math.ceil(h / GRID_SPACING) + 1;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * GRID_SPACING;
        const y = r * GRID_SPACING;
        dots.push({ ox: x, oy: y, x, y });
      }
    }
    dotsRef.current = dots;

    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.8 + 0.8, alpha: Math.random() * 0.35 + 0.1,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = document.documentElement.scrollHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid(w, h);
    };

    resize();
    window.addEventListener("resize", resize);

    // Re-measure on scroll height changes (content loads)
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(document.documentElement);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY + window.scrollY };
    };

    window.addEventListener("mousemove", handleMouseMove);

    const draw = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const scrollY = window.scrollY;

      // Viewport-relative mouse for culling
      const viewTop = scrollY;
      const viewBottom = scrollY + window.innerHeight;

      // Theme colors
      const dotCol = isDark ? "rgba(100,181,246," : "rgba(14,165,233,";
      const lineCol = isDark ? "rgba(41,151,255," : "rgba(14,165,233,";
      const glowCol = isDark ? "rgba(41,151,255," : "rgba(14,165,233,";
      const pCol = isDark ? "rgba(100,181,246," : "rgba(56,189,248,";

      const activeDots: { x: number; y: number; intensity: number }[] = [];

      // Update and draw grid dots
      for (const dot of dotsRef.current) {
        // Only process dots near viewport (performance)
        if (dot.oy < viewTop - 200 || dot.oy > viewBottom + 200) continue;

        const dist = Math.hypot(dot.ox - mx, dot.oy - my);
        const inRange = dist < CURSOR_RADIUS;
        const intensity = inRange ? 1 - dist / CURSOR_RADIUS : 0;

        // Flow: displace dots away from cursor
        if (inRange && dist > 1) {
          const angle = Math.atan2(dot.oy - my, dot.ox - mx);
          const displacement = intensity * intensity * FLOW_STRENGTH;
          dot.x = dot.ox + Math.cos(angle) * displacement;
          dot.y = dot.oy + Math.sin(angle) * displacement;
        } else {
          // Spring back smoothly
          dot.x += (dot.ox - dot.x) * 0.08;
          dot.y += (dot.oy - dot.y) * 0.08;
        }

        const baseAlpha = isDark ? 0.06 : 0.1;
        const alpha = baseAlpha + intensity * (isDark ? 0.6 : 0.5);
        const radius = DOT_BASE_RADIUS + intensity * 2.5;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `${dotCol}${alpha})`;
        ctx.fill();

        if (intensity > 0.25) {
          // Glow
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, radius + 5, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, radius + 5);
          grad.addColorStop(0, `${glowCol}${intensity * 0.25})`);
          grad.addColorStop(1, `${glowCol}0)`);
          ctx.fillStyle = grad;
          ctx.fill();
          activeDots.push({ x: dot.x, y: dot.y, intensity });
        }
      }

      // Connections between active dots
      for (let i = 0; i < activeDots.length; i++) {
        for (let j = i + 1; j < activeDots.length; j++) {
          const a = activeDots[i], b = activeDots[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < CONNECTION_DIST) {
            const alpha = (1 - d / CONNECTION_DIST) * Math.min(a.intensity, b.intensity) * 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `${lineCol}${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // Cursor glow
      if (mx > 0 && my > 0) {
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, CURSOR_RADIUS * 0.5);
        grad.addColorStop(0, `${glowCol}${isDark ? 0.06 : 0.04})`);
        grad.addColorStop(1, `${glowCol}0)`);
        ctx.beginPath();
        ctx.arc(mx, my, CURSOR_RADIUS * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Ambient particles (only in viewport)
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Skip if not in viewport
        if (p.y < viewTop - 100 || p.y > viewBottom + 100) continue;

        const pdist = Math.hypot(p.x - mx, p.y - my);
        if (pdist < CURSOR_RADIUS * 0.7) {
          const angle = Math.atan2(p.y - my, p.x - mx);
          const force = (1 - pdist / (CURSOR_RADIUS * 0.7)) * 0.3;
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
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
      resizeObserver.disconnect();
    };
  }, [isDark, buildGrid]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
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
