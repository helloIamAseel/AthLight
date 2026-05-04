import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import athlightLogo from "@/assets/athlight_logo_v2.png";
import { useReturnToApp } from "@/hooks/useReturnToApp";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  rightContent?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, backTo, rightContent }: PageHeaderProps) {
  const navigate = useNavigate();
  const returnToApp = useReturnToApp("/feed");

  const handleBack = () => {
    if (backTo) navigate(backTo);
    else returnToApp();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-card/90 backdrop-blur-md px-4 py-3">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <button
          onClick={handleBack}
          className="shrink-0 flex items-center justify-center h-9 w-9 rounded-xl bg-muted/50 text-foreground/60 hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <img src={athlightLogo} alt="AthLight" className="h-8 w-8 object-contain shrink-0 logo-glow" />

        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-extrabold tracking-tight text-gradient-brand">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>

        {rightContent && <div className="shrink-0">{rightContent}</div>}
      </div>
    </header>
  );
}
