import React from "react";

interface StatPillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export default function StatPill({ icon, label, value }: StatPillProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-muted/50 py-2.5 px-2 border border-border/40 transition-all duration-200 hover:border-secondary/30 hover:shadow-sm hover:-translate-y-0.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg icon-bg-gradient">
        {icon}
      </div>
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <strong className="text-sm font-bold text-foreground">{value}</strong>
    </div>
  );
}
