import { useState } from "react";
import Navigation from "@/components/navigation";
import CommandMenu from "@/components/command-menu";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import ExperienceSection from "@/components/experience-section";
import ProjectsSection from "@/components/projects-section";
import GithubSection from "@/components/github-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Portfolio() {
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="relative overflow-x-clip">
      <div className="paper-grain" aria-hidden />
      <Navigation onCommand={() => setCommandOpen(true)} />
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
      <main>
        <HeroSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <GithubSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
