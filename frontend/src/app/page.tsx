import AmbientBackground from "@/components/scene/ambient-background";
import FloatingDock from "@/components/scene/floating-dock";
import HeroPanel from "@/components/scene/hero-panel";
import MouseGlow from "@/components/scene/mouse-glow";
import Particles from "@/components/scene/particles";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <AmbientBackground />
      <Particles />
      <MouseGlow />
      <FloatingDock />
      <HeroPanel />
    </main>
  );
}