import React from "react";
import FloatingLantern from "../components/FloatingLantern";
import { ArrowRight, Moon } from "lucide-react";

const LandingPage = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div className="bg-background text-foreground relative overflow-x-hidden">
      <div className="absolute inset-0 z-0">
        <FloatingLantern size="lg" className="top-20 left-10" delay={0} />
        <FloatingLantern size="md" className="top-40 right-20" delay={1} />
        <FloatingLantern size="sm" className="top-60 left-1/4" delay={2} />
        <FloatingLantern size="md" className="top-32 right-1/3" delay={0.5} />
        <FloatingLantern size="sm" className="top-80 right-10" delay={1.5} />
        <FloatingLantern size="lg" className="top-20
         left-1/2" delay={2.5} />
      </div>
      <main className="relative z-10">
        <section className="min-h-screen flex items-center justify-center text-center px-4">
          <div>
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-6">
              <Moon className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-yellow-300 bg-clip-text text-transparent mb-6">
              Welcome to Vlant
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Release your anonymous thoughts into the night sky.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onRegisterClick}
                className="px-8 h-14 text-lg rounded-full bg-primary text-primary-foreground font-bold shadow-lg glow-effect transition-all hover:bg-primary/90 flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onLoginClick}
                className="px-8 h-14 text-lg rounded-full border border-border bg-card/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                I have an account
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
