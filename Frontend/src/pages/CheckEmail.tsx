import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { Mail } from "lucide-react";

const CheckEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as { email?: string })?.email || "";
  const [status, setStatus] = useState<"idle" | "resent">("idle");

  const handleResend = (e: React.MouseEvent) => {
    e.preventDefault();
    setStatus("resent");
    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <MainLayout backTo="/forgot-password">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10">
            <Mail className="h-8 w-8 text-secondary" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground">Check Your Email</h1>
        <p className="mt-3 text-muted-foreground">
          We have sent a password reset link to <br />
          <strong className="text-foreground">{email || "your email"}</strong>
        </p>

        <div className="mt-8 text-sm text-muted-foreground">
          {status === "resent" ? (
            <p className="font-medium text-success">✓ A new link has been sent!</p>
          ) : (
            <p>
              Didn't receive the email?{" "}
              <button onClick={handleResend} className="font-semibold text-secondary hover:underline">
                Resend Link
              </button>
            </p>
          )}
        </div>

        <button
          onClick={() => navigate("/login")}
          className="mt-6 text-sm font-medium text-secondary hover:underline"
        >
          Back to Login
        </button>
      </div>
    </MainLayout>
  );
};

export default CheckEmail;
