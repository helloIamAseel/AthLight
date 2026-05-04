import { useState, useMemo, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return "Please enter your email address.";
  if (!email.includes("@")) return "An email address must contain a single @.";
  if (!emailRegex.test(email)) return "An email address must contain a single @.";
  return undefined;
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);

  const emailError = useMemo(() => {
    return touched ? validateEmail(email) : undefined;
  }, [email, touched]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const error = validateEmail(email);
    if (!error) {
      console.log("Reset link requested for:", email.trim());
      navigate("/check-email", { state: { email: email.trim() } });
    }
  };

  return (
    <MainLayout backTo="/login">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Forgot your Password?
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter your email address to receive a password reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-foreground">
              Email<span className="text-destructive ml-0.5">*</span>
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched) setTouched(true);
              }}
              onBlur={() => setTouched(true)}
              placeholder="example: someone@example.com"
            />
            {touched && emailError && (
              <p className="text-xs text-destructive">{emailError}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={touched && !!emailError}
            className="w-full py-6 text-base"
            size="lg"
          >
            Send Link
          </Button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full text-center text-sm font-medium text-secondary hover:underline"
          >
            Back to Login
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default ForgotPassword;
