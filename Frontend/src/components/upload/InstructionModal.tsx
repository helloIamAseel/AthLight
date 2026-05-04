import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

type SessionType = "training" | "match";

interface InstructionModalProps {
  sessionType: SessionType;
  onConfirm: () => void;
  onClose: () => void;
}

const TIPS: Record<SessionType, string[]> = {
  match: [
    "Comprehensive view covering the pitch.",
    "Continuous footage without replays.",
    "Avoid frequent zooming or angle changes.",
  ],
  training: [
    "Full body visible from head to toe.",
    "Steady camera and clear angle.",
    "Natural speed without effects.",
  ],
};

const TITLES: Record<SessionType, string> = {
  match: "Match Guidelines",
  training: "Training Guidelines",
};

const InstructionModal = ({ sessionType, onConfirm, onClose }: InstructionModalProps) => {
  const tips = TIPS[sessionType];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-5"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-sm rounded-2xl bg-card border border-border shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="text-lg font-semibold text-foreground">{TITLES[sessionType]}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <ul className="px-5 space-y-2">
          {tips.map((tip, i) => (
            <motion.li
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/10"
            >
              <span className="text-sm text-muted-foreground">•</span>
              <p className="text-sm font-medium text-foreground">{tip}</p>
            </motion.li>
          ))}
        </ul>

        <div className="mx-5 mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-destructive">
            Field markings are required for accurate stats!
          </p>
        </div>

        <div className="p-5 space-y-2">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Yes, I understand
          </button>
          <button
            onClick={onClose}
            className="w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Back
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InstructionModal;
