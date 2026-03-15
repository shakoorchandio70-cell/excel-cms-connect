import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle2, XCircle, TrendingUp, FileText } from "lucide-react";

const DashboardPage = () => {
  const { data: complaints = [] } = useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === "Open").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
    closed: complaints.filter((c) => c.status === "Closed").length,
    critical: complaints.filter((c) => c.priority === "Critical").length,
  };

  const statCards = [
    { label: "Total Complaints", value: stats.total, icon: FileText, className: "bg-primary/10 text-primary" },
    { label: "Open", value: stats.open, icon: AlertCircle, className: "status-open" },
    { label: "In Progress", value: stats.inProgress, icon: Clock, className: "status-in-progress" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle2, className: "status-resolved" },
    { label: "Closed", value: stats.closed, icon: XCircle, className: "status-closed" },
    { label: "Critical", value: stats.critical, icon: TrendingUp, className: "status-critical" },
  ];

  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">CATI E&M Dashboard</h2>
        <p className="text-muted-foreground">Overview of your complaint management system</p>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {recentComplaints.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No complaints yet. Create your first complaint.</p>
          ) : (
            <div className="space-y-3">
              {recentComplaints.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{c.complaint_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.status === "Open" ? "status-open" :
                        c.status === "In Progress" ? "status-in-progress" :
                        c.status === "Resolved" ? "status-resolved" : "status-closed"
                      }`}>{c.status}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.priority === "Critical" ? "status-critical" :
                        c.priority === "High" ? "status-open" : "bg-muted text-muted-foreground"
                      }`}>{c.priority}</span>
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
    </div>
  );
};

export default DashboardPage;
