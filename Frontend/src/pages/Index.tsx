import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { RoleOption } from "@/components/RoleOption";
import { Button } from "@/components/ui/button";

type Role = "" | "athlete" | "coach" | "scout";

const Index = () => {
  const [role, setRole] = useState<Role>("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!role) return;
    navigate(`/register/${role}`);
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="mt-2 text-muted-foreground">Choose your role to get started</p>
        </div>

        <div className="flex flex-col gap-3">
          <RoleOption
            title="Athlete"
            features={[
              "Analyze performance with AI video insights",
              "Track progress with smart metrics",
              "Grow through coach feedback",
            ]}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="5" r="3" />
                <path d="m6.5 8 3 5.5-2 3.5L4 21" />
                <path d="m17.5 8-3 5.5 2 3.5L20 21" />
                <path d="M12 13.5V10" />
              </svg>
            }
            selected={role === "athlete"}
            onClick={() => setRole("athlete")}
          />
          <RoleOption
            title="Coach"
            features={[
              "Provide structured athlete feedback",
              "Deliver analyzable performance insights",
              "Drive meaningful improvement",
            ]}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
              </svg>
            }
            selected={role === "coach"}
            onClick={() => setRole("coach")}
          />
          <RoleOption
            title="Scout"
            features={[
              "Identify top talent efficiently",
              "Use data-driven performance insights",
              "Explore interactive dashboards",
            ]}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            }
            selected={role === "scout"}
            onClick={() => setRole("scout")}
          />
        </div>

        <Button onClick={handleContinue} disabled={!role} className="mt-8 w-full py-6 text-base" size="lg">
          Continue
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="font-semibold text-secondary hover:underline">
            Log in
          </a>
        </p>
      </div>
    </MainLayout>
  );
};

export default Index;
