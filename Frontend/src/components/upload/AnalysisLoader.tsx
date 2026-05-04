import { motion } from "framer-motion";

interface AnalysisLoaderProps {
  progress: number;
}

const AnalysisLoader = ({ progress }: AnalysisLoaderProps) => {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{Math.round(progress)}%</span>
        </div>
      </div>
      <div className="mt-8 text-center">
        <h3 className="text-lg font-semibold text-foreground">AI Initial Analysis</h3>
        <p className="text-sm text-muted-foreground mt-1 animate-progress-pulse">
          Identifying Player IDs...
        </p>
      </div>
    </motion.div>
  );
};

export default AnalysisLoader;
