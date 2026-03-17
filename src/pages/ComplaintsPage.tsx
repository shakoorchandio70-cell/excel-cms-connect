import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Download, Upload, Search, Filter, UserPlus, Edit, MessageSquare, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import * as XLSX from "xlsx";
import AssignModal from "@/components/AssignModal";
import EditComplaintModal from "@/components/EditComplaintModal";
import UpdateStatusModal from "@/components/UpdateStatusModal";
import ResolutionCard from "@/components/ResolutionCard";
import FeedbackViewModal from "@/components/FeedbackViewModal";

const CATEGORIES = [
  "Bulb / lighting fault", "Fan replacement", "Short circuit",
  "Fluctuation of voltages", "Generator / power issue", "Additional supply request",
  "AC not working", "Low cooling in AC", "Water cooler not working", "Mechanical fault",
];
const SECTIONS = [
  "ANS - ATS Block", "ANS - ATSEP Block", "APS - ES Block", "APS - RFFS Block",
  "Regulatory School", "Aviation Management School",
  "Camp Commandant", "Security", "SQMS", "Logistics", "Finance", "HR",
  "Civil Works", "IT", "Motor Transport", "Medical Center", "Sports",
  "Admin", "Academics", "Communication Electronics", "Library",
  "Hyderabad Airport", "Residential Area", "Hostel & Mess",
];
const PRIORITIES = ["Low", "Medium", "High", "Critical", "Urgent"];
const STATUSES = ["Open", "In Progress", "Resolved", "Completed", "Reopened"];

const statusClass = (s: string) => {
  switch (s) {
    case "Open": return "status-open";
    case "In Progress": return "status-in-progress";
    case "Resolved": return "status-resolved";
    case "Completed": return "status-completed";
    case "Reopened": return "status-reopened";
    default: return "status-closed";
  }
};

const ComplaintsPage = () => {
  const { user } = useAuth();
  const { isAdmin, isTechnician, isOfficial } = useUserRole();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [assignComplaint, setAssignComplaint] = useState<any>(null);
  const [editComplaint, setEditComplaint] = useState<any>(null);
  const [updateStatusComplaint, setUpdateStatusComplaint] = useState<any>(null);
  const [feedbackComplaintId, setFeedbackComplaintId] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
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

  const { data: feedbackMap = {} } = useQuery({
    queryKey: ["all-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feedback").select("complaint_id, action");
      if (error) throw error;
      const map: Record<string, boolean> = {};
      data.forEach((f: any) => { map[f.complaint_id] = true; });
      return map;
    },
  });

  const profileMap = Object.fromEntries(profiles.map((p) => [p.user_id, p]));

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from("complaints").insert({
        title: data.title,
        description: data.description,
        category: data.category || "AC not working",
        section: data.section || "ANS - ATS Block",
        priority: data.priority || "Medium",
        complainant_name: data.complainant_name,
        complainant_email: data.complainant_email,
        complainant_phone: data.complainant_phone,
        complaint_number: "",
        created_by: user!.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint created successfully");
      setCreateOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleAssignSave = async (data: { assigned_to: string; priority?: string; notes?: string }) => {
    const updates: any = {
      assigned_to: data.assigned_to,
      assigned_at: new Date().toISOString(),
      status: "In Progress",
      last_updated_by: user!.id,
      last_updated_at: new Date().toISOString(),
    };
    if (data.priority) updates.priority = data.priority;
    const { error } = await supabase.from("complaints").update(updates).eq("id", assignComplaint.id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["complaints"] });
    toast.success("Technician assigned successfully");
  };

  const handleEditSave = async (data: any) => {
    const { error } = await supabase.from("complaints").update({
      ...data,
      last_updated_by: user!.id,
      last_updated_at: new Date().toISOString(),
    } as any).eq("id", editComplaint.id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["complaints"] });
    toast.success("Complaint updated");
  };

  const handleUpdateStatusSave = async (data: { status: string; resolution_notes?: string }) => {
    const updates: any = {
      status: data.status,
      last_updated_by: user!.id,
      last_updated_at: new Date().toISOString(),
    };
    if (data.resolution_notes) updates.resolution_notes = data.resolution_notes;
    if (data.status === "Resolved") updates.resolved_at = new Date().toISOString();
    const { error } = await supabase.from("complaints").update(updates).eq("id", updateStatusComplaint.id);
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ["complaints"] });
    toast.success("Status updated");
  };

  // Filter: technicians only see their own
  let filtered = complaints;
  if (isTechnician && !isAdmin) {
    filtered = filtered.filter((c) => c.assigned_to === user?.id);
  }

  // Sort: reopened first, then urgent, then by date
  filtered = [...filtered].sort((a, b) => {
    if (a.status === "Reopened" && b.status !== "Reopened") return -1;
    if (b.status === "Reopened" && a.status !== "Reopened") return 1;
    if (a.priority === "Urgent" && b.priority !== "Urgent") return -1;
    if (b.priority === "Urgent" && a.priority !== "Urgent") return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Apply search/status filters
  filtered = filtered.filter((c) => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.complaint_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const exportData = filtered.map((c) => ({
      "Complaint #": c.complaint_number,
      Title: c.title,
      Category: c.category,
      Section: c.section,
      Priority: c.priority,
      Status: c.status,
      "Assigned To": profileMap[c.assigned_to]?.full_name || "—",
      "Created At": new Date(c.created_at).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Complaints");
    XLSX.writeFile(wb, `complaints_${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success("Exported to Excel");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
        let imported = 0;
        for (const row of data) {
          const { error } = await supabase.from("complaints").insert({
            title: row["Title"] || "Imported Complaint",
            description: row["Description"] || null,
            category: row["Category"] || "AC not working",
            section: row["Section"] || "ANS - ATS Block",
            priority: row["Priority"] || "Medium",
            complaint_number: "",
            created_by: user!.id,
          });
          if (!error) imported++;
        }
        queryClient.invalidateQueries({ queryKey: ["complaints"] });
        toast.success(`Imported ${imported} complaints`);
      } catch { toast.error("Failed to parse file"); }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Complaints</h2>
          <p className="text-muted-foreground">
            {isTechnician && !isAdmin ? "Your assigned tasks" : "Manage and track all complaints"}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-1" /> Import
                  <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
                </label>
              </Button>
            </>
          )}
          {(isAdmin || isOfficial) && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Complaint</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Create Complaint</DialogTitle></DialogHeader>
                <ComplaintForm onSubmit={(data) => createMutation.mutate(data)} loading={createMutation.isPending} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search complaints..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" /><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No complaints found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <>
                      <TableRow key={c.id} className={c.status === "Reopened" ? "bg-destructive/5" : ""}>
                        <TableCell>
                          {c.status === "Reopened" && c.reopen_count > 0 && (
                            <button onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}>
                              {expandedRow === c.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{c.complaint_number}</TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {c.title}
                          {c.status === "Reopened" && c.reopen_count > 0 && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-destructive text-destructive-foreground">
                              Reopened ×{c.reopen_count}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{c.category}</TableCell>
                        <TableCell className="text-sm">{c.section || "—"}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            c.priority === "Urgent" ? "status-critical" :
                            c.priority === "Critical" ? "status-critical" :
                            c.priority === "High" ? "status-open" : "bg-muted text-muted-foreground"
                          }`}>{c.priority}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass(c.status)}`}>
                            {c.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{profileMap[c.assigned_to]?.full_name || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {/* Admin buttons */}
                            {isAdmin && (c.status === "Open" || c.status === "Reopened") && (
                              <Button size="sm" variant="default" className="h-7 text-xs bg-[hsl(220,70%,50%)] hover:bg-[hsl(220,70%,40%)]" onClick={() => setAssignComplaint(c)}>
                                <UserPlus className="h-3 w-3 mr-1" /> Assign
                              </Button>
                            )}
                            {isAdmin && c.status === "In Progress" && (
                              <Button size="sm" variant="outline" className="h-7 text-xs border-[hsl(220,70%,50%)] text-[hsl(220,70%,50%)]" onClick={() => setAssignComplaint(c)}>
                                <RefreshCw className="h-3 w-3 mr-1" /> Re-assign
                              </Button>
                            )}
                            {isAdmin && (
                              <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => setEditComplaint(c)}>
                                <Edit className="h-3 w-3 mr-1" /> Edit
                              </Button>
                            )}
                            {isAdmin && feedbackMap[c.id] && (
                              <Button size="sm" variant="outline" className="h-7 text-xs border-purple-500 text-purple-600" onClick={() => setFeedbackComplaintId(c.id)}>
                                <MessageSquare className="h-3 w-3 mr-1" /> Feedback
                              </Button>
                            )}

                            {/* Technician button */}
                            {isTechnician && !isAdmin && c.assigned_to === user?.id && (c.status === "Open" || c.status === "In Progress" || c.status === "Reopened") && (
                              <Button size="sm" className="h-7 text-xs bg-[hsl(145,63%,42%)] hover:bg-[hsl(145,63%,35%)]" onClick={() => setUpdateStatusComplaint(c)}>
                                Update Status
                              </Button>
                            )}

                            {/* Official: show resolution card inline for resolved */}
                            {isOfficial && c.status === "Resolved" && c.created_by === user?.id && (
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}>
                                Review
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {/* Expanded row for reopen reason or resolution card */}
                      {expandedRow === c.id && (
                        <TableRow key={`${c.id}-expanded`}>
                          <TableCell colSpan={10} className="bg-muted/50 p-4">
                            {c.status === "Reopened" && (
                              <div className="text-sm">
                                <span className="font-medium text-destructive">Reopen Reason: </span>
                                {/* We'd need to fetch from feedback, simplified here */}
                                <span className="text-muted-foreground">Complaint was reopened. Check feedback for details.</span>
                              </div>
                            )}
                            {c.status === "Resolved" && c.created_by === user?.id && (
                              <ResolutionCard
                                complaint={c}
                                onStatusChange={() => {
                                  queryClient.invalidateQueries({ queryKey: ["complaints"] });
                                  setExpandedRow(null);
                                }}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {assignComplaint && (
        <AssignModal complaint={assignComplaint} open={!!assignComplaint} onClose={() => setAssignComplaint(null)} onSave={handleAssignSave} />
      )}
      {editComplaint && (
        <EditComplaintModal complaint={editComplaint} open={!!editComplaint} onClose={() => setEditComplaint(null)} onSave={handleEditSave} />
      )}
      {updateStatusComplaint && (
        <UpdateStatusModal complaint={updateStatusComplaint} open={!!updateStatusComplaint} onClose={() => setUpdateStatusComplaint(null)} onSave={handleUpdateStatusSave} />
      )}
      {feedbackComplaintId && (
        <FeedbackViewModal complaintId={feedbackComplaintId} open={!!feedbackComplaintId} onClose={() => setFeedbackComplaintId(null)} />
      )}
    </div>
  );
};

function ComplaintForm({ onSubmit, loading }: { onSubmit: (data: any) => void; loading: boolean }) {
  const [form, setForm] = useState({
    title: "", description: "", category: "AC not working", section: "ANS - ATS Block",
    priority: "Medium", complainant_name: "", complainant_email: "", complainant_phone: "",
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Select value={form.section} onValueChange={(v) => setForm({ ...form, section: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{SECTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Priority</Label>
        <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Complainant Name</Label>
        <Input value={form.complainant_name} onChange={(e) => setForm({ ...form, complainant_name: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={form.complainant_email} onChange={(e) => setForm({ ...form, complainant_email: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.complainant_phone} onChange={(e) => setForm({ ...form, complainant_phone: e.target.value })} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : "Create Complaint"}
      </Button>
    </form>
  );
}

export default ComplaintsPage;
