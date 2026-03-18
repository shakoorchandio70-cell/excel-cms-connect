import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";

interface ItemUsed {
  item_id: string;
  qty: string;
}

interface UpdateStatusModalProps {
  complaint: any;
  open: boolean;
  onClose: () => void;
  onSave: (data: { status: string; resolution_notes?: string; items_used?: { item_id: string; qty: number }[] }) => Promise<void>;
}

const UpdateStatusModal = ({ complaint, open, onClose, onSave }: UpdateStatusModalProps) => {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState(complaint?.resolution_notes || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [itemsUsed, setItemsUsed] = useState<ItemUsed[]>([]);

  const { data: inventory = [] } = useQuery({
    queryKey: ["inventory-in-stock"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("*").gt("current_stock", 0).order("item_name");
      if (error) throw error;
      return data;
    },
  });

  const getAllowedStatuses = () => {
    const current = complaint?.status;
    if (current === "Open" || current === "Reopened") return ["In Progress", "Resolved"];
    if (current === "In Progress") return ["Resolved"];
    return [];
  };

  const allowed = getAllowedStatuses();

  const addItem = () => setItemsUsed([...itemsUsed, { item_id: "", qty: "1" }]);
  const removeItem = (idx: number) => setItemsUsed(itemsUsed.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof ItemUsed, value: string) => {
    const updated = [...itemsUsed];
    updated[idx] = { ...updated[idx], [field]: value };
    setItemsUsed(updated);
  };

  const getMaxQty = (itemId: string) => {
    const item = inventory.find((i: any) => i.id === itemId);
    return item ? Number(item.current_stock) : 0;
  };

  const handleSubmit = async () => {
    setError("");
    if (!status) { setError("Select a status"); return; }
    if (status === "Resolved" && notes.length < 20) {
      setError("Work notes must be at least 20 characters");
      return;
    }

    // Validate items used
    const validItems: { item_id: string; qty: number }[] = [];
    for (const item of itemsUsed) {
      if (!item.item_id) { setError("Select an item or remove the empty row"); return; }
      const qty = Number(item.qty);
      if (qty < 1) { setError("Quantity must be at least 1"); return; }
      const max = getMaxQty(item.item_id);
      if (qty > max) {
        const invItem = inventory.find((i: any) => i.id === item.item_id);
        setError(`${invItem?.item_name}: only ${max} in stock`);
        return;
      }
      validItems.push({ item_id: item.item_id, qty });
    }

    setSaving(true);
    try {
      await onSave({ status, resolution_notes: status === "Resolved" ? notes : undefined, items_used: validItems.length > 0 ? validItems : undefined });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // Items already selected (to avoid duplicates in dropdown)
  const selectedIds = new Set(itemsUsed.map((i) => i.item_id).filter(Boolean));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
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

          {/* Items Used Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Items Used (optional)</Label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={addItem}>
                <Plus className="h-3 w-3 mr-1" /> Add Item
              </Button>
            </div>
            {itemsUsed.map((item, idx) => {
              const selectedItem = inventory.find((i: any) => i.id === item.item_id);
              const max = selectedItem ? Number(selectedItem.current_stock) : 0;
              return (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Select value={item.item_id} onValueChange={(v) => updateItem(idx, "item_id", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select item..." /></SelectTrigger>
                      <SelectContent>
                        {inventory.filter((i: any) => !selectedIds.has(i.id) || i.id === item.item_id).map((i: any) => (
                          <SelectItem key={i.id} value={i.id}>
                            {i.item_name} — {Number(i.current_stock)} in stock
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      min="1"
                      max={max}
                      value={item.qty}
                      onChange={(e) => updateItem(idx, "qty", e.target.value)}
                      className="h-9 text-xs"
                      placeholder="Qty"
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeItem(idx)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

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
