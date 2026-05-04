import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Circle, Eye, EyeOff } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const checks = useMemo(
    () => ({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
    }),
    [password]
  );

  useEffect(() => {
    let score = 0;
    if (checks.length) score++;
    if (checks.uppercase) score++;
    if (checks.number) score++;
    setStrength(score);
  }, [checks]);

  const isMatching = password === confirmPassword && confirmPassword !== "";
  const showMatchError = confirmPassword.length > 0 && !isMatching;
  const canSubmit = checks.length && checks.uppercase && checks.number && isMatching;

  const strengthLabel = strength === 0 ? "" : strength === 1 ? "Weak" : strength === 2 ? "Medium" : "Strong";
  const strengthColor =
    strength === 1 ? "bg-destructive" : strength === 2 ? "bg-accent" : strength === 3 ? "bg-success" : "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      console.log("Password reset submitted");
      navigate("/password-changed");
    }
  };

  return (
    <MainLayout backTo="/login">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              New Password<span className="text-destructive ml-0.5">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                className="pr-10"
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
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${strengthColor}`}
                    style={{ width: `${(strength / 3) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{strengthLabel}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Confirm Password<span className="text-destructive ml-0.5">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="pr-10"
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

          <ul className="space-y-1.5 text-sm">
            <ConditionItem label="At least 8 characters" isMet={checks.length} />
            <ConditionItem label="One uppercase letter" isMet={checks.uppercase} />
            <ConditionItem label="At least one number" isMet={checks.number} />
          </ul>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-6 text-base"
            size="lg"
          >
            Save Changes
          </Button>
        </form>
      </div>
    </MainLayout>
  );
};

const ConditionItem = ({ label, isMet }: { label: string; isMet: boolean }) => (
  <li className="flex items-center gap-2">
    {isMet ? (
      <Check className="h-4 w-4 text-success" />
    ) : (
      <Circle className="h-4 w-4 text-muted-foreground" />
    )}
    <span className={isMet ? "text-foreground" : "text-muted-foreground"}>{label}</span>
  </li>
);

export default ResetPassword;
