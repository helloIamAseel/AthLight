import React, { useMemo } from "react";
import { Trash2 } from "lucide-react";
import "./DeleteConfirmCard.css";
import { getDeleteContent, type DeleteKind } from "./deleteConfig";

type Props = {
  open: boolean;
  kind: DeleteKind;
  itemName?: string;
  layout?: "stacked" | "inline";
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmCard({
  open,
  kind,
  itemName,
  layout = "inline",
  loading = false,
  onCancel,
  onConfirm,
}: Props) {
  const content = useMemo(() => getDeleteContent(kind, itemName), [kind, itemName]);

  if (!open) return null;

  return (
    <div className="dcc-card" role="dialog" aria-modal="true" aria-label={content.title}>
      <div className="dcc-body">
        <div className="dcc-icon" aria-hidden="true">
          <Trash2 size={22} strokeWidth={2.2} />
        </div>
        <h3 className="dcc-title">{content.title}</h3>
        <div className="dcc-msg">
          {content.messagePrefix}
          {content.itemStrong ? <span className="dcc-strong">{content.itemStrong}</span> : null}
          {content.messageSuffix}
        </div>
        <div className={`dcc-actions ${layout === "stacked" ? "stacked" : "inline"}`}>
          <button className="dcc-btn dcc-cancel" onClick={onCancel} disabled={loading}>
            {content.cancelText}
          </button>
          <button className="dcc-btn dcc-danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting…" : content.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
