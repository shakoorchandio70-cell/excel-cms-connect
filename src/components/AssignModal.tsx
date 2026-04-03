import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface AssignModalProps {
  complaint: any;
  open: boolean;
  onClose: () => void;
  onSave: (data: { assigned_to: string; priority?: string; notes?: string }) => Promise<void>;
}

const AssignModal = ({ complaint, open, onClose, onSave }: AssignModalProps) => {
  const [selectedTech, setSelectedTech] = useState(complaint?.assigned_to || "");
  const [priority, setPriority] = useState(complaint?.priority || "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: technicians = [] } = useQuery({
    queryKey: ["assignable-technicians"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_profiles");
      if (error) throw error;
      return (data || []).filter((p: any) => p.is_assignable && !p.is_excluded);
    },
  });

  const { data: complaintCounts = {} } = useQuery({
    queryKey: ["tech-complaint-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("assigned_to")
        .in("status", ["Open", "In Progress", "Reopened"]);
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((c) => {
        if (c.assigned_to) counts[c.assigned_to] = (counts[c.assigned_to] || 0) + 1;
      });
      return counts;
    },
  });

  const sortedTechs = [...technicians].sort(
    (a, b) => (complaintCounts[a.user_id] || 0) - (complaintCounts[b.user_id] || 0)
  );

  const handleSubmit = async () => {
    if (!selectedTech) return;
    setSaving(true);
    try {
      await onSave({ assigned_to: selectedTech, priority: priority || undefined, notes: notes || undefined });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign — {complaint?.complaint_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">Title:</span> <span className="font-medium">{complaint?.title}</span></div>
            <div><span className="text-muted-foreground">Category:</span> <span>{complaint?.category}</span></div>
            <div><span className="text-muted-foreground">Priority:</span> <span>{complaint?.priority}</span></div>
            <div><span className="text-muted-foreground">Location:</span> <span>{complaint?.section}</span></div>
          </div>

          <div className="space-y-2">
            <Label>Assign Technician *</Label>
            <Select value={selectedTech} onValueChange={setSelectedTech}>
              <SelectTrigger><SelectValue placeholder="Select technician..." /></SelectTrigger>
              <SelectContent>
                {sortedTechs.map((t) => {
                  const count = complaintCounts[t.user_id] || 0;
                  const color = count === 0 ? "text-green-600" : count >= 4 ? "text-amber-600" : "";
                  return (
                    <SelectItem key={t.user_id} value={t.user_id}>
                      <span className={color}>
                        {t.full_name} — {t.trade || "General"} ({count} open tasks)
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority Override</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Low", "Medium", "High", "Critical", "Urgent"].map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Internal Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional notes..." />
          </div>

          <Button onClick={handleSubmit} disabled={!selectedTech || saving} className="w-full bg-[hsl(220,70%,50%)] hover:bg-[hsl(220,70%,40%)] text-white">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Assigning...</> : "Assign Technician"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignModal;
