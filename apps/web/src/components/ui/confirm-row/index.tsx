import { Button } from "#app/components/ui/button";
import "./styles.css";

export function ConfirmRow({
  message,
  confirmLabel = "Confirm",
  pending,
  ariaLabel,
  onCancel,
  onConfirm,
}: {
  message: string;
  confirmLabel?: string;
  pending: boolean;
  ariaLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="confirm-row" role="group" aria-label={ariaLabel}>
      <span>{message}</span>
      <Button variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button disabled={pending} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  );
}
