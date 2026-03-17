import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface UpdateStatusModalProps {
  complaint: any;
  open: boolean;
  onClose: () => void;
  onSave: (data: { status: string; resolution_notes?: string }) => Promise<void>;
}

const UpdateStatusModal = ({ complaint, open, onClose, onSave }: UpdateStatusModalProps) => {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState(complaint?.resolution_notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Allowed transitions for technician
  const getAllowedStatuses = () => {
    const current = complaint?.status;
    if (current === "Open" || current === "Reopened") return ["In Progress", "Resolved"];
    if (current === "In Progress") return ["Resolved"];
    return [];
  };

  const allowed = getAllowedStatuses();

  const handleSubmit = async () => {
    setError("");
    if (!status) { setError("Select a status"); return; }
    if (status === "Resolved" && notes.length < 20) {
      setError("Work notes must be at least 20 characters");
      return;
    }
    setSaving(true);
    try {
      await onSave({ status, resolution_notes: status === "Resolved" ? notes : undefined });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Status — {complaint?.complaint_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Title:</span> <span className="font-medium">{complaint?.title}</span></div>
            <div><span className="text-muted-foreground">Location:</span> <span>{complaint?.section}</span></div>
            <div><span className="text-muted-foreground">Category:</span> <span>{complaint?.category}</span></div>
            <div><span className="text-muted-foreground">Priority:</span> <span>{complaint?.priority}</span></div>
          </div>

          <div className="space-y-2">
            <Label>New Status *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
              <SelectContent>
                {allowed.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {status === "Resolved" && (
            <div className="space-y-2">
              <Label>Work Notes *</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Describe the work done..."
              />
              <p className={`text-xs ${notes.length < 20 ? "text-destructive" : "text-muted-foreground"}`}>
                {notes.length}/20 characters minimum
              </p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {status === "Resolved" && (
            <div className="p-3 rounded-lg bg-[hsl(var(--status-resolved)/0.1)] border border-[hsl(var(--status-resolved)/0.3)] text-sm">
              Complainant will be notified to confirm resolution
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={saving || allowed.length === 0}
            className="w-full bg-[hsl(145,63%,42%)] hover:bg-[hsl(145,63%,35%)] text-white"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Updating...</> : "Update Status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusModal;
