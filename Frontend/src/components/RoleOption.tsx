import { cn } from "@/lib/utils";

interface RoleOptionProps {
  title: string;
  features: string[];
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}

export function RoleOption({ title, features, icon, selected, onClick }: RoleOptionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-5 text-left transition-all duration-300 spotlight-hover group",
        selected
          ? "border-secondary/60 bg-gradient-to-r from-secondary/8 via-primary/5 to-transparent shadow-spotlight"
          : "border-border/60 bg-card hover:border-secondary/30 hover:shadow-md"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 mt-0.5",
            selected
              ? "gradient-brand text-primary-foreground shadow-glow"
              : "icon-bg-gradient text-primary group-hover:shadow-sm"
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "text-base font-bold transition-colors",
            selected ? "text-primary" : "text-foreground"
          )}>{title}</h3>
          <ul className="mt-1.5 space-y-1">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-[13px] text-muted-foreground leading-snug">
                <span className={cn(
                  "h-1 w-1 shrink-0 rounded-full",
                  selected ? "bg-secondary" : "bg-muted-foreground/40"
                )} />
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div
          className={cn(
            "ml-auto h-5 w-5 shrink-0 rounded-full border-2 transition-all duration-300 flex items-center justify-center mt-0.5",
            selected ? "border-secondary bg-secondary shadow-sm" : "border-muted-foreground/25 group-hover:border-secondary/40"
          )}
        >
          {selected && (
            <svg viewBox="0 0 20 20" fill="currentColor" className="text-secondary-foreground h-3 w-3">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
