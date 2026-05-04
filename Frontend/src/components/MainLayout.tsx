import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import athlightLogo from "@/assets/athlight_logo_v2.png";

interface Props {
  children: React.ReactNode;
  backTo?: string;
}

const MainLayout: React.FC<Props> = ({ children, backTo }) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-brand-gradient p-4">
      <div className="relative w-full max-w-[850px] min-h-[500px] rounded-2xl bg-card/95 backdrop-blur-sm p-8 md:p-10 shadow-lg border border-border/30">
        {/* Back button */}
        {backTo && (
          <button
            onClick={() => navigate(backTo)}
            className="absolute top-5 left-5 md:top-6 md:left-6 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-secondary transition-colors duration-200 group z-10"
          >
            <span className="flex items-center justify-center h-8 w-8 rounded-xl bg-muted/60 group-hover:bg-secondary/10 transition-colors duration-200">
              <ArrowLeft className="h-4 w-4" />
            </span>
          </button>
        )}

        {/* Logo with glow */}
        <div className="mb-8 flex justify-center">
          <img
            src={athlightLogo}
            alt="AthLight"
            className="h-24 w-auto object-contain logo-glow animate-float"
          />
        </div>
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
