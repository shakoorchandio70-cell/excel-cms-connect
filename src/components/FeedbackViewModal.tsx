import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StarRating from "./StarRating";

interface FeedbackViewModalProps {
  complaintId: string;
  open: boolean;
  onClose: () => void;
}

const FeedbackViewModal = ({ complaintId, open, onClose }: FeedbackViewModalProps) => {
  const { data: feedbackList = [] } = useQuery({
    queryKey: ["feedback-list", complaintId],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("complaint_id", complaintId)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Feedback History</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {feedbackList.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No feedback yet</p>
          ) : feedbackList.map((fb: any) => (
            <div key={fb.id} className="p-3 rounded-lg border text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className={`font-medium ${fb.action === "completed" ? "text-[hsl(var(--status-resolved))]" : "text-destructive"}`}>
                  {fb.action === "completed" ? "Completed" : "Reopened"}
                </span>
                <span className="text-xs text-muted-foreground">{new Date(fb.submitted_at).toLocaleDateString()}</span>
              </div>
              {fb.rating && <StarRating value={fb.rating} readonly size="sm" />}
              {fb.comment && <p className="text-muted-foreground italic">"{fb.comment}"</p>}
              {fb.reopen_reason && <p className="text-destructive">Reason: {fb.reopen_reason}</p>}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackViewModal;
