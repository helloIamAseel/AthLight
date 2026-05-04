import { useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import SendFeedbackModal from "@/components/SendFeedbackModal";

const Feedback = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <MainLayout>
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-3 text-2xl font-bold text-foreground">Player Feedback</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Send detailed performance feedback to players on your team.
        </p>

        <Button size="lg" className="px-10 py-6 text-base" onClick={() => setShowModal(true)}>
          Send Feedback
        </Button>
      </div>

      {showModal && (
        <SendFeedbackModal
          playerId="player-001"
          playerName="Ahmed Al-Rashid"
          onClose={() => setShowModal(false)}
          onSubmit={(payload) => {
            console.log("Feedback submitted:", payload);
            setShowModal(false);
          }}
        />
      )}
    </MainLayout>
  );
};

export default Feedback;
