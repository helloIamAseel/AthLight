import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FeedbackPayload = {
  playerId: string;
  score: number;
  comment: string;
  checklistCompleted: number;
};

interface Props {
  playerId: string;
  playerName: string;
  onClose: () => void;
  onSubmit: (payload: FeedbackPayload) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_CHARS = 500;
const REQUIRED_CHECKS = 4;

type Signals = {
  hasDetail: boolean;
  hasTimeRef: boolean;
  hasReason: boolean;
  hasSuggestion: boolean;
  hasAnalytical: boolean;
};

type SignalKey = keyof Signals;

function scoreColor(n: number | null): string {
  if (n === null) return "hsl(var(--muted))";
  if (n >= 7) return "hsl(149, 46%, 56%)";
  if (n >= 4) return "hsl(53, 82%, 63%)";
  return "hsl(var(--destructive))";
}

const CHECKS: {
  key: SignalKey;
  label: string;
  hint: string;
  test: (t: string) => boolean;
}[] = [
  {
    key: "hasDetail",
    label: "Enough detail",
    hint: 'Write 2–3 sentences (not just "good job").',
    test: (t) => t.trim().length >= 80,
  },
  {
    key: "hasTimeRef",
    label: "When it happened",
    hint: 'Add timing (e.g., "minute 60", "first half").',
    test: (t) =>
      /minute|min|half|match|period|first half|second half|early|late/.test(t),
  },
  {
    key: "hasReason",
    label: "Explain why",
    hint: "Add the reason (because / due to / as a result).",
    test: (t) =>
      /because|since|due to|therefore|as a result|so that|which led to/.test(t),
  },
  {
    key: "hasSuggestion",
    label: "Improvement tip",
    hint: "Give 1 actionable tip (next time / should / focus on).",
    test: (t) =>
      /should|needs to|recommend|suggest|next time|focus on|improve|work on|try to/.test(t),
  },
  {
    key: "hasAnalytical",
    label: "Analysis language",
    hint: "Use performance words (positioning, pressing, awareness…).",
    test: (t) =>
      /progress|positioning|pressing|transition|awareness|decision making|intensity|spacing|tempo|consistency|accuracy|marking|tracking|build-up|possession/.test(t),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

const SendFeedbackModal = ({ playerId, playerName, onClose, onSubmit }: Props) => {
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [scoreError, setScoreError] = useState("");

  const scoreNumber = useMemo<number | null>(() => {
    const t = score.trim();
    if (!t || t === "." || t.endsWith(".")) return null;
    const n = Number(t);
    return Number.isNaN(n) ? null : n;
  }, [score]);

  const isScoreValid = scoreNumber !== null && scoreNumber >= 0 && scoreNumber <= 10;

  const signals = useMemo<Signals>(() => {
    const t = comment.toLowerCase();
    return Object.fromEntries(
      CHECKS.map(({ key, test }) => [key, test(t)])
    ) as Signals;
  }, [comment]);

  const completedCount = useMemo(
    () => Object.values(signals).filter(Boolean).length,
    [signals]
  );

  const canSubmit =
    score.trim() !== "" &&
    isScoreValid &&
    comment.trim().length > 0 &&
    completedCount >= REQUIRED_CHECKS;

  const handleScoreChange = (raw: string) => {
    setScore(raw);
    const t = raw.trim();
    if (!t || t === "." || t.endsWith(".")) {
      setScoreError("Score is required (0–10).");
      return;
    }
    const n = Number(t);
    if (Number.isNaN(n)) {
      setScoreError("Please enter a valid number (0–10).");
      return;
    }
    setScoreError(n < 0 || n > 10 ? "Score must be between 0 and 10." : "");
  };

  const handleCommentChange = (raw: string) => {
    if (raw.length <= MAX_CHARS) setComment(raw);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit || scoreNumber === null) return;
    onSubmit({
      playerId,
      score: Number(scoreNumber.toFixed(1)),
      comment: comment.trim(),
      checklistCompleted: completedCount,
    });
  };

  const charCount = comment.length;
  const checklistReady = completedCount >= REQUIRED_CHECKS;

  const submitLabel = canSubmit
    ? "Submit Feedback"
    : score.trim() === "" || !isScoreValid
    ? "Enter a valid score (0–10)"
    : comment.trim().length === 0
    ? "Write a comment first"
    : `Complete ${REQUIRED_CHECKS - completedCount} more item${
        REQUIRED_CHECKS - completedCount > 1 ? "s" : ""
      }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-lg rounded-2xl bg-card shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label={`Send feedback for ${playerName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
            🧑‍💼
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-card-foreground">Send Feedback</div>
            <div className="text-xs text-muted-foreground">
              To: <strong>{playerName}</strong>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="max-h-[60vh] space-y-5 overflow-y-auto px-6 py-5">
            {/* Score */}
            <div className="space-y-2">
              <Label htmlFor="sfm-score" className="text-sm font-medium text-card-foreground">
                Performance Score <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="sfm-score"
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  required
                  className={`w-24 text-center text-lg font-bold ${
                    scoreError
                      ? "border-destructive focus-visible:ring-destructive"
                      : isScoreValid
                      ? "border-primary focus-visible:ring-primary"
                      : ""
                  }`}
                  value={score}
                  onChange={(e) => handleScoreChange(e.target.value)}
                  placeholder="0–10"
                  aria-invalid={!!scoreError}
                />
                <div className="flex-1 space-y-1">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: isScoreValid ? `${(scoreNumber! / 10) * 100}%` : "0%",
                        background: scoreColor(scoreNumber),
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>0 — Poor</span>
                    <span>5 — Average</span>
                    <span>10 — Excellent</span>
                  </div>
                </div>
              </div>
              {scoreError && (
                <p className="text-xs text-destructive" role="alert">⚠ {scoreError}</p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sfm-comment" className="text-sm font-medium text-card-foreground">
                  Comment <span className="text-destructive">*</span>
                </Label>
                <span
                  className={`text-xs font-medium ${
                    charCount >= MAX_CHARS
                      ? "text-destructive"
                      : charCount > MAX_CHARS * 0.85
                      ? "text-accent-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                This feedback is used for <strong>monthly performance analysis</strong>. You only
                need <strong>{REQUIRED_CHECKS} out of 5</strong> checklist items to submit.
              </p>

              <textarea
                id="sfm-comment"
                className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={comment}
                onChange={(e) => handleCommentChange(e.target.value)}
                placeholder="Be specific: mention the moment, explain why it happened, and give one improvement tip."
                rows={5}
                required
              />
            </div>

            {/* Checklist */}
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-card-foreground">
                  Feedback Quality — {completedCount}/5
                </span>
                <span
                  className={`text-xs font-medium ${
                    checklistReady ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {checklistReady
                    ? "✓ Ready to submit"
                    : `Need ${REQUIRED_CHECKS - completedCount} more`}
                </span>
              </div>

              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${(completedCount / 5) * 100}%` }}
                />
              </div>

              <ul className="space-y-2" role="list">
                {CHECKS.map(({ key, label, hint }) => {
                  const done = signals[key];
                  return (
                    <li
                      key={key}
                      className={`flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${
                        done ? "text-card-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                          done
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-background"
                        }`}
                        aria-hidden="true"
                      >
                        {done && <Check className="h-2.5 w-2.5" />}
                      </span>
                      <span>
                        <strong className="block text-xs">{label}</strong>
                        <span className="text-[11px] text-muted-foreground">{hint}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <footer className="border-t border-border px-6 py-4">
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Discard
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {submitLabel}
              </Button>
            </div>
            {!canSubmit && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                You can submit when: score is <strong>0–10</strong>, comment is filled, and{" "}
                <strong>{REQUIRED_CHECKS}</strong> checklist items are done.
              </p>
            )}
          </footer>
        </form>
      </div>
    </div>
  );
};

export default SendFeedbackModal;
