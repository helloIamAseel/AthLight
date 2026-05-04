import { motion } from "framer-motion";
import { Check, RefreshCw, User } from "lucide-react";
import LowConfidenceAlert from "./LowConfidenceAlert";

interface PlayerGridProps {
  selectedIds: number[];
  onToggle: (id: number) => void;
  onRetry: () => void;
  onConfirm: () => void;
  lowConfidence?: boolean;
  onDismissAlert?: () => void;
}

const PlayerGrid = ({ selectedIds, onToggle, onRetry, onConfirm, lowConfidence, onDismissAlert }: PlayerGridProps) => {
  const players = [0, 1, 2, 3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      <div className="px-5 pt-6 pb-4 text-center">
        <h2 className="text-xl font-bold text-foreground">Which one is you?</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select your player frame(s) to continue
        </p>
      </div>

      {lowConfidence && <LowConfidenceAlert onDismiss={onDismissAlert ?? (() => {})} />}

      <div className="flex-1 px-5 overflow-y-auto pt-3">
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          {players.map((id) => {
            const isSelected = selectedIds.includes(id);
            return (
              <motion.button
                key={id}
                whileTap={{ scale: 0.97 }}
                onClick={() => onToggle(id)}
                className={`relative aspect-square rounded-xl border-2 transition-all duration-200 overflow-hidden bg-muted flex items-center justify-center ${
                  isSelected
                    ? "border-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <User className="w-8 h-8 text-muted-foreground/40" />
                <span className="absolute bottom-1.5 left-1.5 text-[11px] font-medium text-muted-foreground bg-card/80 px-1.5 py-0.5 rounded-md">
                  Player {id + 1}
                </span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="p-5 space-y-3 border-t border-border bg-card">
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try New Frames
        </button>
        <button
          onClick={onConfirm}
          disabled={selectedIds.length === 0}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
            selectedIds.length > 0
              ? "bg-primary text-primary-foreground hover:opacity-90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          Confirm Selection{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
        </button>
      </div>
    </motion.div>
  );
};

export default PlayerGrid;
