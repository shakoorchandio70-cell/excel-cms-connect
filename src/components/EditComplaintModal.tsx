import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const CATEGORIES = [
  "Bulb / lighting fault", "Fan replacement", "Short circuit",
  "Fluctuation of voltages", "Generator / power issue", "Additional supply request",
  "AC not working", "Low cooling in AC", "Water cooler not working", "Mechanical fault",
];
const PRIORITIES = ["Low", "Medium", "High", "Critical", "Urgent"];
const STATUSES = ["Open", "In Progress", "Resolved", "Completed", "Reopened"];

interface EditComplaintModalProps {
  complaint: any;
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const EditComplaintModal = ({ complaint, open, onClose, onSave }: EditComplaintModalProps) => {
  const [form, setForm] = useState({
    title: complaint?.title || "",
    priority: complaint?.priority || "Medium",
    category: complaint?.category || "",
    status: complaint?.status || "Open",
    assigned_to: complaint?.assigned_to || "",
    resolution_notes: complaint?.resolution_notes || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { data: technicians = [] } = useQuery({
    queryKey: ["assignable-technicians"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_profiles");
      if (error) throw error;
      return (data || []).filter((p: any) => p.is_assignable && !p.is_excluded);
    },
  });

  const handleSubmit = async () => {
    setError("");
    if (form.status === "Resolved" && (!form.resolution_notes || form.resolution_notes.length < 20)) {
      setError("Resolution notes must be at least 20 characters");
      return;
    }
    const updates: any = { ...form };
    if (form.status === "Reopened") {
      updates.priority = "Urgent";
      updates.reopened_at = new Date().toISOString();
    }
    if (form.status === "Resolved") {
      updates.resolved_at = new Date().toISOString();
    }
    setSaving(true);
    try {
      await onSave(updates);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit — {complaint?.complaint_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <Select value={form.assigned_to || "unassigned"} onValueChange={(v) => setForm({ ...form, assigned_to: v === "unassigned" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {technicians.map((t) => (
                    <SelectItem key={t.user_id} value={t.user_id}>{t.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Resolution Notes {form.status === "Resolved" && <span className="text-destructive">*</span>}</Label>
            <Textarea
              value={form.resolution_notes}
              onChange={(e) => setForm({ ...form, resolution_notes: e.target.value })}
              rows={3}
            />
            {form.status === "Resolved" && (
              <p className={`text-xs ${(form.resolution_notes?.length || 0) < 20 ? "text-destructive" : "text-muted-foreground"}`}>
                {form.resolution_notes?.length || 0}/20 characters minimum
              </p>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditComplaintModal;
