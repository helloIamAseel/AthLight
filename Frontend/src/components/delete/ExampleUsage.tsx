import React, { useState } from "react";
import DeleteConfirmCard from "./DeleteConfirmCard";
import type { DeleteKind } from "./deleteConfig";

export default function ExampleUsage() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<DeleteKind>("item");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const openDelete = (k: DeleteKind, n: string) => {
    setKind(k);
    setName(n);
    setOpen(true);
  };

  const onCancel = () => {
    if (loading) return;
    setOpen(false);
  };

  const onConfirm = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: 40 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => openDelete("video", "Video 12")}>Delete Video</button>
        <button onClick={() => openDelete("feedback", "Ahmed Ali - training")}>Delete Feedback</button>
      </div>
      <DeleteConfirmCard
        open={open}
        kind={kind}
        itemName={name}
        layout="inline"
        loading={loading}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </div>
  );
}
