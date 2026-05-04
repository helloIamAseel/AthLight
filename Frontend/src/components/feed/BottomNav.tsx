import React from "react";

export interface NavItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  isFab?: boolean;
}

interface BottomNavProps {
  items: NavItem[];
}

export default function BottomNav({ items }: BottomNavProps) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-border/30 bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-2xl items-center justify-around py-2">
        {items.map((item) =>
          item.isFab ? (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className="flex h-12 w-12 items-center justify-center rounded-full gradient-brand text-primary-foreground shadow-glow -translate-y-3 hover:shadow-xl hover:scale-110 transition-all duration-300"
            >
              {item.icon}
            </button>
          ) : (
            <button
              key={item.key}
              type="button"
              onClick={item.onClick}
              className={`relative flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-all duration-200 ${
                item.isActive
                  ? "text-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <span className={`transition-transform duration-200 ${item.isActive ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] font-semibold transition-colors duration-200 ${item.isActive ? "text-secondary" : ""}`}>
                {item.label}
              </span>
              {item.isActive && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full bg-gradient-to-r from-primary to-secondary" />
              )}
            </button>
          )
        )}
      </div>
    </footer>
  );
}
