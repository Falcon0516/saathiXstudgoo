import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AboutProfile from "@/components/AboutProfile";
import ProblemSection from "@/components/ProblemSection";
import Simulation1 from "@/components/Simulation1";
import Simulation2 from "@/components/Simulation2";
import Simulation3 from "@/components/Simulation3";
import VoiceShowcase from "@/components/VoiceShowcase";
import AdvantagesSection from "@/components/AdvantagesSection";
import IntelligenceGrid from "@/components/IntelligenceGrid";
import Footer from "@/components/Footer";
import LiveChatbot from "@/components/LiveChatbot";

const Divider = () => (
  <div className="section-divider" />
);

export default function Home() {
  return (
    <main style={{ position: "relative" }}>
      <Navigation />
      <HeroSection />
      <Divider />
      <AboutProfile />
      <Divider />
      <ProblemSection />
      <Divider />
      <IntelligenceGrid />
      <Divider />

      {/* ── Simulations Hub ── */}
      <section id="simulations" style={{
        position: "relative", padding: "120px 0", overflow: "hidden",
        background: "var(--bg)",
      }}>
        <div className="float-zero-g" style={{
          position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
          width: "50vw", height: "40vw", borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(41,151,255,0.05), transparent 60%)",
          filter: "blur(100px)",
        }} />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2997FF", display: "block", marginBottom: 16 }}>
              Live Engine
            </span>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--text-primary)", marginBottom: 24, lineHeight: 1.1 }}>
              The 3 Autonomous <span className="aurora-text-gradient">Pillars</span>
            </h2>
            <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 640, margin: "0 auto", lineHeight: 1.7 }}>
              Interactive simulations you can click through right now. Each one
              demonstrates a core capability that replaces an entire manual workflow.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
            <Simulation1 />
            <Simulation2 />
            <Simulation3 />
          </div>
        </div>
      </section>

      <Divider />
      <VoiceShowcase />
      <Divider />
      <AdvantagesSection />
      <Divider />
      <Footer />

      {/* Floating chatbot — always present */}
      <LiveChatbot />
    </main>
  );
}
