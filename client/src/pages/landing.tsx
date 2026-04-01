import { useState } from "react";
import { Hero } from "@/components/landing/hero";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { SocialProof } from "@/components/landing/social-proof";
import { LeadForm } from "@/components/landing/lead-form";
import { LoginModal } from "@/components/landing/login-modal";
import logo from "@assets/Letter_R_(1)_1766118629756.png";
import { Button } from "@/components/ui/button";

function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const scrollToForm = () => {
    document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-4 bg-background/50 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="container mx-auto max-w-6xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Operly" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold tracking-tight text-white">Operly</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <Button 
            variant="ghost"
            size="sm" 
            onClick={onLoginClick}
            className="text-sm text-muted-foreground hover:text-white transition-colors px-3" 
            data-testid="link-login"
          >
            Login
          </Button>
          <Button 
            size="sm" 
            className="rounded-full px-4 sm:px-6 bg-white/10 hover:bg-white/20 text-white border border-white/5 text-xs sm:text-sm"
            onClick={scrollToForm}
          >
            <span className="hidden sm:inline">Fale com a equipe</span>
            <span className="sm:hidden">Contato</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-white/5 bg-black/20">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div className="flex items-center gap-2 opacity-50">
          <img src={logo} alt="Operly" className="h-6 w-6 object-contain" />
          <span className="text-lg font-bold text-white">Operly</span>
        </div>
        
        <p className="text-sm text-muted-foreground">
          © 2024 Operly. Todos os direitos reservados.
        </p>

        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-white transition-colors">Termos</a>
          <a href="#" className="hover:text-white transition-colors">Privacidade</a>
          <a href="https://instagram.com/operlybr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Navbar onLoginClick={() => setLoginModalOpen(true)} />
      <Hero />
      <ProblemSolution />
      <SocialProof />
      <LeadForm />
      <Footer />
      <LoginModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </div>
  );
}
