import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2 } from "lucide-react";
import StarRating from "./StarRating";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ResolutionCardProps {
  complaint: any;
  onStatusChange: () => void;
}

const ResolutionCard = ({ complaint, onStatusChange }: ResolutionCardProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reopenExpanded, setReopenExpanded] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [saving, setSaving] = useState(false);

  // Check if feedback already exists
  const { data: existingFeedback } = useQuery({
    queryKey: ["feedback", complaint.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("complaint_id", complaint.id)
        .order("submitted_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] || null;
    },
  });

  // Get technician name
  const { data: techProfile } = useQuery({
    queryKey: ["tech-profile", complaint.assigned_to],
    enabled: !!complaint.assigned_to,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_public_profiles");
      if (error) throw error;
      const match = (data || []).find((p: any) => p.user_id === complaint.assigned_to);
      return match || { full_name: "Unknown" };
    },
  });

  const isCreator = user?.id === complaint.created_by;
  const isResolved = complaint.status === "Resolved";
  const isCompleted = complaint.status === "Completed";

  // Show read-only summary if feedback exists
  if (existingFeedback && existingFeedback.action === "completed") {
    return (
      <Card className="border-[hsl(var(--status-resolved)/0.3)]">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <StarRating value={existingFeedback.rating || 0} readonly size="sm" />
            <span className="text-sm text-muted-foreground">({existingFeedback.rating}/5)</span>
            <span className="text-sm">|</span>
            <span className="text-sm font-medium text-[hsl(var(--status-resolved))]">Fully resolved</span>
            {existingFeedback.comment && (
              <>
                <span className="text-sm">|</span>
                <span className="text-sm italic text-muted-foreground">"{existingFeedback.comment}"</span>
              </>
            )}
            <span className="text-sm">|</span>
            <span className="text-xs text-muted-foreground">
              {new Date(existingFeedback.submitted_at).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isResolved || !isCreator) return null;

  const handleComplete = async () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    setSaving(true);
    try {
      await supabase.from("feedback").insert({
        complaint_id: complaint.id,
        submitted_by: user!.id,
        rating,
        comment: comment || null,
        action: "completed",
      } as any);
      await supabase.from("complaints").update({
        status: "Completed",
        last_updated_by: user!.id,
        last_updated_at: new Date().toISOString(),
      } as any).eq("id", complaint.id);
      toast.success("Thank you! Complaint closed.");
      onStatusChange();
    } finally {
      setSaving(false);
    }
  };

  const handleReopen = async () => {
    if (reopenReason.length < 20) { toast.error("Reason must be at least 20 characters"); return; }
    setSaving(true);
    try {
      await supabase.from("feedback").insert({
        complaint_id: complaint.id,
        submitted_by: user!.id,
        reopen_reason: reopenReason,
        action: "reopened",
      } as any);
      await supabase.from("complaints").update({
        status: "Reopened",
        priority: "Urgent",
        reopened_at: new Date().toISOString(),
        reopen_count: (complaint.reopen_count || 0) + 1,
        last_updated_by: user!.id,
        last_updated_at: new Date().toISOString(),
      } as any).eq("id", complaint.id);
      toast.success("Complaint reopened and escalated");
      onStatusChange();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-[hsl(var(--status-resolved)/0.3)]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[hsl(var(--status-resolved))]" />
          <CardTitle className="text-base">Your complaint has been resolved</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Resolved by {techProfile?.full_name || "Technician"} on{" "}
          {complaint.resolved_at ? new Date(complaint.resolved_at).toLocaleDateString() : "—"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {complaint.resolution_notes && (
          <div className="p-3 rounded-lg bg-muted text-sm">
            <p className="font-medium text-xs text-muted-foreground mb-1">Resolution Notes</p>
            {complaint.resolution_notes}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Close & Rate */}
          <div className="p-4 rounded-lg border space-y-3">
            <p className="font-medium text-sm">Satisfied with the resolution?</p>
            <StarRating value={rating} onChange={setRating} />
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional comments..."
              rows={2}
            />
            <Button
              onClick={handleComplete}
              disabled={saving}
              className="w-full bg-[hsl(145,63%,42%)] hover:bg-[hsl(145,63%,35%)] text-white"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit & Close
            </Button>
          </div>

          {/* Reopen */}
          <div className="p-4 rounded-lg border space-y-3">
            <p className="font-medium text-sm">Issue not resolved?</p>
            {!reopenExpanded ? (
              <Button
                variant="outline"
                onClick={() => setReopenExpanded(true)}
                className="w-full border-destructive text-destructive hover:bg-destructive/10"
              >
                Reopen Complaint
              </Button>
            ) : (
              <>
                <Textarea
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Explain why the issue is not resolved..."
                  rows={3}
                />
                <p className={`text-xs ${reopenReason.length < 20 ? "text-destructive" : "text-muted-foreground"}`}>
                  {reopenReason.length}/20 characters minimum
                </p>
                <Button
                  onClick={handleReopen}
                  disabled={saving}
                  className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Confirm Reopen
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResolutionCard;
