import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface TacticalNoticeProps {
  onConfirm: () => void;
  onClose: () => void;
}

const TacticalNotice = ({ onConfirm, onClose }: TacticalNoticeProps) => {
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
        <div className="p-5 pb-3">
          <h3 className="text-lg font-semibold text-foreground">Tactical Footage Required</h3>
        </div>
        <div className="px-5">
          <div className="p-4 rounded-xl bg-accent/10 border border-accent/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-foreground leading-relaxed">
              For pro-level results, upload <strong>Tactical Footage</strong> (wide-angle/full pitch). Avoid broadcast-style videos with frequent cuts.
            </p>
          </div>
        </div>
        <div className="p-5">
          <button
            onClick={onConfirm}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Got it, Upload
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TacticalNotice;
