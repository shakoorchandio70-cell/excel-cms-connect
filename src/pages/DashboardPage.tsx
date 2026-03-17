import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Clock, CheckCircle2, XCircle, TrendingUp, FileText, Star, RotateCcw, Percent } from "lucide-react";
import StarRating from "@/components/StarRating";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const { isAdmin, isTechnician } = useUserRole();

  const { data: complaints = [] } = useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: feedbackList = [] } = useQuery({
    queryKey: ["all-feedback-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feedback").select("*").order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const profileMap = Object.fromEntries(profiles.map((p) => [p.user_id, p]));

  // Filter for technician
  const relevantComplaints = isTechnician && !isAdmin
    ? complaints.filter((c) => c.assigned_to === user?.id)
    : complaints;

  const stats = {
    total: relevantComplaints.length,
    open: relevantComplaints.filter((c) => c.status === "Open").length,
    inProgress: relevantComplaints.filter((c) => c.status === "In Progress").length,
    resolved: relevantComplaints.filter((c) => c.status === "Resolved").length,
    completed: relevantComplaints.filter((c) => c.status === "Completed").length,
    reopened: relevantComplaints.filter((c) => c.status === "Reopened").length,
    critical: relevantComplaints.filter((c) => c.priority === "Critical" || c.priority === "Urgent").length,
  };

  // Feedback analytics
  const completedFeedback = feedbackList.filter((f: any) => f.action === "completed" && f.rating);
  const avgRating = completedFeedback.length > 0
    ? (completedFeedback.reduce((sum: number, f: any) => sum + f.rating, 0) / completedFeedback.length).toFixed(1)
    : "—";
  const totalReopened = feedbackList.filter((f: any) => f.action === "reopened").length;
  const totalFeedback = feedbackList.length;
  const reopenRate = totalFeedback > 0 ? ((totalReopened / totalFeedback) * 100).toFixed(1) : "0";

  const statCards = [
    { label: "Total Complaints", value: stats.total, icon: FileText, className: "bg-primary/10 text-primary" },
    { label: "Open", value: stats.open, icon: AlertCircle, className: "status-open" },
    { label: "In Progress", value: stats.inProgress, icon: Clock, className: "status-in-progress" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle2, className: "status-resolved" },
    { label: "Completed", value: stats.completed, icon: XCircle, className: "status-completed" },
    { label: "Critical/Urgent", value: stats.critical, icon: TrendingUp, className: "status-critical" },
  ];

  const feedbackCards = [
    { label: "Average Rating", value: avgRating, icon: Star, className: "bg-amber-100 text-amber-600" },
    { label: "Total Completed", value: stats.completed, icon: CheckCircle2, className: "bg-green-100 text-green-600" },
    { label: "Total Reopened", value: stats.reopened, icon: RotateCcw, className: "bg-red-100 text-red-600" },
    { label: "Reopen Rate %", value: `${reopenRate}%`, icon: Percent, className: "bg-purple-100 text-purple-600" },
  ];

  const recentComplaints = relevantComplaints.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">CATI E&M Dashboard</h2>
        <p className="text-muted-foreground">
          {isTechnician && !isAdmin ? "Your assigned tasks overview" : "Overview of your complaint management system"}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className={`inline-flex p-2 rounded-lg mb-3 ${stat.className}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feedback Analytics */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {feedbackCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className={`inline-flex p-2 rounded-lg mb-3 ${stat.className}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {recentComplaints.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No complaints yet.</p>
          ) : (
            <div className="space-y-3">
              {recentComplaints.map((c) => (
                <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg border ${c.status === "Reopened" ? "border-destructive/30 bg-destructive/5" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{c.complaint_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.status === "Open" ? "status-open" :
                        c.status === "In Progress" ? "status-in-progress" :
                        c.status === "Resolved" ? "status-resolved" :
                        c.status === "Completed" ? "status-completed" :
                        c.status === "Reopened" ? "status-reopened" : "status-closed"
                      }`}>{c.status}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.priority === "Urgent" || c.priority === "Critical" ? "status-critical" :
                        c.priority === "High" ? "status-open" : "bg-muted text-muted-foreground"
                      }`}>{c.priority}</span>
                      {c.status === "Reopened" && c.reopen_count > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                          Reopened ×{c.reopen_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-card-foreground mt-1 truncate">{c.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Table (Admin only) */}
      {isAdmin && completedFeedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feedback Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Complaint</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbackList.slice(0, 10).map((fb: any) => {
                    const complaint = complaints.find((c) => c.id === fb.complaint_id);
                    return (
                      <TableRow key={fb.id}>
                        <TableCell className="text-xs font-mono">{complaint?.complaint_number || "—"}</TableCell>
                        <TableCell className="text-sm">{complaint?.assigned_to ? profileMap[complaint.assigned_to]?.full_name || "—" : "—"}</TableCell>
                        <TableCell>{fb.rating ? <StarRating value={fb.rating} readonly size="sm" /> : "—"}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${fb.action === "completed" ? "status-resolved" : "status-reopened"}`}>
                            {fb.action === "completed" ? "Resolved" : "Reopened"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(fb.submitted_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;
