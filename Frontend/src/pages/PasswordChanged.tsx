import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PasswordChanged = () => {
  const navigate = useNavigate();

  return (
    <MainLayout backTo="/login">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
            <Check className="h-8 w-8 text-success" />
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-foreground">Password Changed!</h1>

        <p className="mb-8 text-sm text-muted-foreground">
          Your password has been reset successfully.
          <br />
          You can now log in with your new password.
        </p>

        <Button
          onClick={() => navigate("/login")}
          className="w-full py-6 text-base"
          size="lg"
        >
          Back to Login
        </Button>
      </div>
    </MainLayout>
  );
};

export default PasswordChanged;
