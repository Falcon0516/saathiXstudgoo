"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Sun, Moon } from "lucide-react";

const navLinks = [
  { label: "Introduction", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Solutions", href: "#problems" },
  { label: "Simulations", href: "#simulations" },
  { label: "Advantages", href: "#advantages" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "fixed",
        top: 24,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <nav
        className={scrolled ? "glass" : ""}
        style={{
          pointerEvents: "auto",
          padding: "12px 24px",
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          gap: 32,
          background: scrolled ? "var(--glass-bg)" : "transparent",
          border: scrolled ? "1px solid var(--glass-border)" : "1px solid transparent",
          transition: "all 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Logo */}
        <a href="#hero" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div className="aurora-gradient" style={{
            width: 34, height: 34, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(41,151,255,0.35)",
          }}>
            <Zap style={{ width: 16, height: 16, color: "white" }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Saathi</span>
        </a>

        {/* Desktop Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="hidden md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
                textDecoration: "none",
                borderRadius: 999,
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--border)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Theme Toggle */}
        <button
          className="hidden md:flex"
          onClick={() => setIsDark(!isDark)}
          aria-label="Toggle theme"
          style={{
            width: 36, height: 36, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.12)" : "rgba(14,165,233,0.1)"; e.currentTarget.style.color = "var(--text-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          {isDark ? <Sun style={{ width: 16, height: 16 }} /> : <Moon style={{ width: 16, height: 16 }} />}
        </button>

        {/* CTA */}
        <div className="hidden md:flex">
          <a
            href="#simulations"
            className="aurora-border"
            style={{
              padding: "10px 22px",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              background: "var(--surface)",
              borderRadius: 999,
              textDecoration: "none",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            Launch Simulations
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", pointerEvents: "auto" }}
        >
          {mobileOpen ? <X style={{ width: 24, height: 24 }} /> : <Menu style={{ width: 24, height: 24 }} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass"
            style={{
              position: "absolute",
              top: 72,
              left: 24,
              right: 24,
              overflow: "hidden",
              borderRadius: 24,
              pointerEvents: "auto",
            }}
          >
            <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ padding: "12px 16px", fontSize: 14, color: "var(--text-secondary)", textDecoration: "none", borderRadius: 12 }}
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => setIsDark(!isDark)}
                style={{ padding: "12px 16px", fontSize: 14, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", borderRadius: 12, textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}
              >
                {isDark ? <Sun style={{ width: 16, height: 16 }} /> : <Moon style={{ width: 16, height: 16 }} />}
                {isDark ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
