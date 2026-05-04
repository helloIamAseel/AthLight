import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const OTP_LENGTH = 6;
const MAX_VERIFICATION_ATTEMPTS = 3;

interface OtpVerificationStepProps {
  email: string;
  onBack: () => void;
  onVerified: () => void;
}

export default function OtpVerificationStep({ email, onBack, onVerified }: OtpVerificationStepProps) {
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_VERIFICATION_ATTEMPTS);
  const [otpErrorMessage, setOtpErrorMessage] = useState("");
  const [shouldShake, setShouldShake] = useState(false);

  const otpCode = otpDigits.join("");
  const isOtpComplete = otpDigits.every((d) => d !== "");
  const isLocked = attemptsRemaining <= 0;

  useEffect(() => {
  otpInputsRef.current[0]?.focus();

  // send OTP
  fetch("http://localhost:3000/api/otp/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

}, [email]);

  const maskedEmail = useMemo(() => {
    const trimmed = email.trim();
    const [user, domain] = trimmed.split("@");
    if (!user || !domain) return trimmed || "—";
    const maskedUser =
      user.length <= 2
        ? user[0] + "*"
        : user.slice(0, 2) + "*".repeat(Math.min(6, user.length - 2));
    return `${maskedUser}@${domain}`;
  }, [email]);

  const focusIndex = (i: number) => otpInputsRef.current[i]?.focus();

  const showOtpError = (attemptsLeft: number) => {
    if (attemptsLeft >= 2) setOtpErrorMessage("Incorrect code. You have 2 attempts left.");
    else if (attemptsLeft === 1) setOtpErrorMessage("Incorrect code. You have 1 attempt left.");
    else setOtpErrorMessage("You have used all attempts. Please request a new code.");
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 400);
  };

  const handleOtpChange = (index: number, raw: string) => {
    if (isLocked) return;
    const digit = raw.replace(/\D/g, "");
    if (digit.length > 1) return;
    setOtpErrorMessage("");
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) focusIndex(index + 1);
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === "Backspace") {
      if (otpDigits[index]) {
        setOtpDigits((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
        return;
      }
      if (index > 0) focusIndex(index - 1);
    }
  };

  const verifyOtp = async () => {
  if (!isOtpComplete || isLocked) return;

  try {
    const res = await fetch("http://localhost:3000/api/otp/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp: otpCode,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      onVerified();
      return;
    }

    const nextAttempts = attemptsRemaining - 1;
    setAttemptsRemaining(nextAttempts);

    setOtpErrorMessage(data.message || "Invalid OTP");

    setOtpDigits(Array(OTP_LENGTH).fill(""));
    focusIndex(0);

  } catch (err) {
    console.error(err);
    setOtpErrorMessage("Server error");
  }
};

  const resendCode = () => {
    fetch("http://localhost:3000/api/otp/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email }),
});
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-card-foreground">OTP Verification</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A verification code has been sent to{" "}
          <span className="font-medium text-card-foreground">{maskedEmail}</span>
        </p>
      </div>

      <div className={`flex justify-center gap-3 ${shouldShake ? "animate-shake" : ""}`}>
        {otpDigits.map((value, index) => (
          <Input
            key={index}
            ref={(el) => { otpInputsRef.current[index] = el; }}
            className={`h-14 w-14 text-center text-xl font-bold ${otpErrorMessage ? "border-destructive" : ""}`}
            inputMode="numeric"
            maxLength={1}
            value={value}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            disabled={isLocked}
          />
        ))}
      </div>

      {otpErrorMessage ? (
        <p className="text-center text-sm text-destructive">{otpErrorMessage}</p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Attempts remaining: {attemptsRemaining}
        </p>
      )}

      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={verifyOtp}
          disabled={!isOtpComplete || isLocked}
          size="lg"
          className="w-full max-w-xs px-10 py-6 text-base font-semibold"
        >
          {isLocked ? "Locked" : "Verify"}
        </Button>

        <button
          type="button"
          onClick={resendCode}
          disabled={isLocked}
          className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
        >
          Resend code
        </button>

        <button
          type="button"
          onClick={onBack}
          className="text-sm text-muted-foreground hover:underline"
        >
          Back
        </button>
      </div>
    </div>
  );
}
