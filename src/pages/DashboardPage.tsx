import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Clock, CheckCircle2, XCircle, TrendingUp, FileText, Star, RotateCcw, Percent, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
      if (isAdmin) {
        const { data, error } = await supabase.from("profiles").select("*");
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.rpc("get_public_profiles");
      if (error) throw error;
      return data || [];
    },
  });

  const profileMap = Object.fromEntries(profiles.map((p) => [p.user_id, p]));

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

  const completedFeedback = feedbackList.filter((f: any) => f.action === "completed" && f.rating);
  const avgRating = completedFeedback.length > 0
    ? (completedFeedback.reduce((sum: number, f: any) => sum + f.rating, 0) / completedFeedback.length).toFixed(1)
    : "—";
  const totalReopened = feedbackList.filter((f: any) => f.action === "reopened").length;
  const totalFeedback = feedbackList.length;
  const reopenRate = totalFeedback > 0 ? ((totalReopened / totalFeedback) * 100).toFixed(1) : "0";

  const statCards = [
    { label: "Total Complaints", value: stats.total, icon: FileText, color: "#00D4FF" },
    { label: "Open", value: stats.open, icon: AlertCircle, color: "#8B5CF6" },
    { label: "In Progress", value: stats.inProgress, icon: Clock, color: "#00D4FF" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "#10B981" },
    { label: "Completed", value: stats.completed, icon: XCircle, color: "#64748B" },
    { label: "Critical/Urgent", value: stats.critical, icon: TrendingUp, color: "#EF4444" },
  ];

  const feedbackCards = [
    { label: "Average Rating", value: avgRating, icon: Star, color: "#F59E0B" },
    { label: "Total Completed", value: stats.completed, icon: CheckCircle2, color: "#10B981" },
    { label: "Total Reopened", value: stats.reopened, icon: RotateCcw, color: "#EF4444" },
    { label: "Reopen Rate %", value: `${reopenRate}%`, icon: Percent, color: "#8B5CF6" },
  ];

  const recentComplaints = relevantComplaints.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>CATI E&M Dashboard</h2>
        <p style={{ color: '#64748B' }}>
          {isTechnician && !isAdmin ? "Your assigned tasks overview" : "Overview of your complaint management system"}
        </p>
      </div>

      {isAdmin && (
        <Alert style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <AlertTriangle className="h-4 w-4" style={{ color: '#F59E0B' }} />
          <AlertDescription className="text-sm" style={{ color: '#F59E0B' }}>
            SMS notifications are not configured. Connect Twilio to enable SMS alerts to complainants on resolution.
          </AlertDescription>
        </Alert>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[10px] p-4"
            style={{ background: '#12161F', border: '1px solid #1E2535' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs" style={{ color: '#64748B' }}>{stat.label}</p>
              <div
                className="h-7 w-7 rounded-md flex items-center justify-center"
                style={{ background: `${stat.color}15` }}
              >
                <stat.icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Feedback Analytics */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {feedbackCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[10px] p-4"
              style={{ background: '#12161F', border: '1px solid #1E2535' }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs" style={{ color: '#64748B' }}>{stat.label}</p>
                <div
                  className="h-7 w-7 rounded-md flex items-center justify-center"
                  style={{ background: `${stat.color}15` }}
                >
                  <stat.icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: '#F1F5F9' }}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Complaints */}
      <div className="rounded-[10px]" style={{ background: '#12161F', border: '1px solid #1E2535' }}>
        <div className="p-5 pb-0">
          <h3 className="text-base font-semibold" style={{ color: '#F1F5F9' }}>Recent Complaints</h3>
        </div>
        <div className="p-5">
          {recentComplaints.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#64748B' }}>No complaints yet.</p>
          ) : (
            <div className="space-y-2">
              {recentComplaints.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ borderBottom: '1px solid #1A202E' }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: '#64748B' }}>{c.complaint_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.status === "Open" ? "status-open" :
                        c.status === "In Progress" ? "status-in-progress" :
                        c.status === "Resolved" ? "status-resolved" :
                        c.status === "Completed" ? "status-completed" :
                        c.status === "Reopened" ? "status-reopened" : "status-closed"
                      }`}>{c.status}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.priority === "Urgent" || c.priority === "Critical" ? "status-critical" :
                        c.priority === "High" ? "status-open" : ""
                      }`} style={
                        c.priority !== "Urgent" && c.priority !== "Critical" && c.priority !== "High"
                          ? { background: 'rgba(100,116,139,0.12)', color: '#64748B' } : {}
                      }>{c.priority}</span>
                      {c.status === "Reopened" && c.reopen_count > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#EF4444', color: '#fff' }}>
                          Reopened ×{c.reopen_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-1 truncate" style={{ color: '#E2E8F0' }}>{c.title}</p>
                  </div>
                  <span className="text-xs whitespace-nowrap ml-4" style={{ color: '#64748B' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Table (Admin only) */}
      {isAdmin && completedFeedback.length > 0 && (
        <div className="rounded-[10px] overflow-hidden" style={{ background: '#12161F', border: '1px solid #1E2535' }}>
          <div className="p-5 pb-0">
            <h3 className="text-base font-semibold" style={{ color: '#F1F5F9' }}>Feedback Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderBottom: '1px solid #1E2535' }}>
                  <TableHead style={{ color: '#475569' }}>Complaint</TableHead>
                  <TableHead style={{ color: '#475569' }}>Technician</TableHead>
                  <TableHead style={{ color: '#475569' }}>Rating</TableHead>
                  <TableHead style={{ color: '#475569' }}>Status</TableHead>
                  <TableHead style={{ color: '#475569' }}>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackList.slice(0, 10).map((fb: any) => {
                  const complaint = complaints.find((c) => c.id === fb.complaint_id);
                  return (
                    <TableRow key={fb.id} style={{ borderBottom: '1px solid #1A202E' }}>
                      <TableCell className="text-xs font-mono" style={{ color: '#E2E8F0' }}>{complaint?.complaint_number || "—"}</TableCell>
                      <TableCell className="text-sm" style={{ color: '#E2E8F0' }}>{complaint?.assigned_to ? profileMap[complaint.assigned_to]?.full_name || "—" : "—"}</TableCell>
                      <TableCell>{fb.rating ? <StarRating value={fb.rating} readonly size="sm" /> : "—"}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${fb.action === "completed" ? "status-resolved" : "status-reopened"}`}>
                          {fb.action === "completed" ? "Resolved" : "Reopened"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs" style={{ color: '#64748B' }}>{new Date(fb.submitted_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
