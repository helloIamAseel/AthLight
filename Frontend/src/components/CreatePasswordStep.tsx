import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Circle, Eye, EyeOff } from "lucide-react";

interface Props {
  onBack: () => void;
  onSubmit: (password: string) => void;
}

const CreatePasswordStep = ({ onBack, onSubmit }: Props) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  useEffect(() => {
    let score = 0;
    if (checks.length) score++;
    if (checks.uppercase) score++;
    if (checks.number) score++;
    setStrength(score);
  }, [password]);

  const isMatching = password === confirmPassword && confirmPassword !== "";
  const showMatchError = confirmPassword.length > 0 && !isMatching;
  const canSubmit = checks.length && checks.uppercase && checks.number && isMatching;

  const getStrengthLabel = () => {
    if (strength === 0) return "";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Medium";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (strength === 1) return "bg-destructive";
    if (strength === 2) return "bg-accent";
    return "bg-success";
  };

  return (
    <div className="space-y-6">
      <SectionTitle>Create Password</SectionTitle>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-card-foreground">
            Password<span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`pr-10 ${password.length > 0 && strength < 3 ? "border-destructive" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getStrengthColor()}`}
                  style={{ width: `${(strength / 3) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{getStrengthLabel()}</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-card-foreground">
            Confirm Password<span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`pr-10 ${showMatchError ? "border-destructive" : isMatching ? "border-success" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {showMatchError && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Password requirements:</p>
          <ul className="space-y-1.5">
            <ConditionItem label="At least 8 characters" isMet={checks.length} />
            <ConditionItem label="One uppercase letter" isMet={checks.uppercase} />
            <ConditionItem label="At least one number" isMet={checks.number} />
          </ul>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" size="lg" className="px-10 py-6 text-base font-semibold" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="px-10 py-6 text-base font-semibold"
          disabled={!canSubmit}
          onClick={() => onSubmit(password)}
        >
          Create Account
        </Button>
      </div>
    </div>
  );
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-0.5 w-4 rounded-full bg-secondary" />
      <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">{children}</h2>
    </div>
  );
}

function ConditionItem({ label, isMet }: { label: string; isMet: boolean }) {
  return (
    <li className="flex items-center gap-2">
      {isMet ? (
        <Check className="h-3.5 w-3.5 text-success" />
      ) : (
        <Circle className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span className={`text-xs ${isMet ? "text-card-foreground" : "text-muted-foreground"}`}>{label}</span>
    </li>
  );
}

export default CreatePasswordStep;
