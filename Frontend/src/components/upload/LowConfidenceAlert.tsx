import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface LowConfidenceAlertProps {
  onDismiss: () => void;
}

const LowConfidenceAlert = ({ onDismiss }: LowConfidenceAlertProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-5 mt-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 space-y-2"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <strong className="text-sm font-semibold text-destructive">Accuracy Alert</strong>
      </div>
      <p className="text-sm font-medium text-destructive leading-relaxed">
        Suboptimal quality detected. Please select the clearest frames to maintain high precision.
      </p>
      <button
        onClick={onDismiss}
        className="text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors"
      >
        Got it
      </button>
    </motion.div>
  );
};

export default LowConfidenceAlert;
