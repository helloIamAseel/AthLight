import { motion } from "framer-motion";
import { ChevronRight, Video, Dumbbell } from "lucide-react";

interface SelectionOverlayProps {
  onSelect: (type: "training" | "match") => void;
  onClose: () => void;
}

const options = [
  {
    id: "training" as const,
    label: "Training Session",
    description: "Record and analyze your practice",
    icon: Dumbbell,
  },
  {
    id: "match" as const,
    label: "Match Video",
    description: "Upload full game footage",
    icon: Video,
  },
];

const SelectionOverlay = ({ onSelect, onClose }: SelectionOverlayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-md p-5 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl bg-card border border-border shadow-xl overflow-hidden">
          <div className="p-5 pb-2">
            <h3 className="text-lg font-semibold text-foreground">Upload Session</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Choose the type of video</p>
          </div>
          <div className="p-3 space-y-2">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => onSelect(option.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <option.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
          <div className="px-5 pb-4">
            <button
              onClick={onClose}
              className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Back
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SelectionOverlay;
