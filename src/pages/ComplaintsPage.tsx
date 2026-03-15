import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Download, Upload, Search, Filter } from "lucide-react";
import * as XLSX from "xlsx";

type Complaint = {
  id: string;
  complaint_number: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  complainant_name: string | null;
  complainant_email: string | null;
  complainant_phone: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
};

const CATEGORIES = ["AC not working", "Bulb replacement", "Fan not working", "Electrical fault", "Plumbing issue", "Other"];
const SECTIONS = ["ANS ATS", "ANS ATSEP", "APS ES", "APS RFFS"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

const ComplaintsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editComplaint, setEditComplaint] = useState<Complaint | null>(null);

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Complaint[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Complaint>) => {
      const { error } = await supabase.from("complaints").insert({
        title: data.title!,
        description: data.description,
        category: data.category || "General",
        priority: data.priority || "Medium",
        complainant_name: data.complainant_name,
        complainant_email: data.complainant_email,
        complainant_phone: data.complainant_phone,
        complaint_number: "",
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint created successfully");
      setCreateOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Complaint> & { id: string }) => {
      const { error } = await supabase.from("complaints").update({
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: data.status,
        complainant_name: data.complainant_name,
        complainant_email: data.complainant_email,
        complainant_phone: data.complainant_phone,
        resolution_notes: data.resolution_notes,
        resolved_at: data.status === "Resolved" ? new Date().toISOString() : null,
      }).eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint updated successfully");
      setEditComplaint(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const filtered = complaints.filter((c) => {
    const matchesSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.complaint_number.toLowerCase().includes(search.toLowerCase()) || (c.complainant_name?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const exportData = filtered.map((c) => ({
      "Complaint #": c.complaint_number,
      Title: c.title,
      Description: c.description || "",
      Category: c.category,
      Priority: c.priority,
      Status: c.status,
      "Complainant Name": c.complainant_name || "",
      "Complainant Email": c.complainant_email || "",
      "Complainant Phone": c.complainant_phone || "",
      "Resolution Notes": c.resolution_notes || "",
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
            title: row["Title"] || row["title"] || "Imported Complaint",
            description: row["Description"] || row["description"] || null,
            category: row["Category"] || row["category"] || "General",
            priority: row["Priority"] || row["priority"] || "Medium",
            complainant_name: row["Complainant Name"] || row["complainant_name"] || null,
            complainant_email: row["Complainant Email"] || row["complainant_email"] || null,
            complainant_phone: row["Complainant Phone"] || row["complainant_phone"] || null,
            complaint_number: "",
            created_by: user!.id,
          });
          if (!error) imported++;
        }
        queryClient.invalidateQueries({ queryKey: ["complaints"] });
        toast.success(`Imported ${imported} complaints`);
      } catch {
        toast.error("Failed to parse Excel file");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Complaints</h2>
          <p className="text-muted-foreground">Manage and track all complaints</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-1" /> Import
              <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
            </label>
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Complaint</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Complaint</DialogTitle>
              </DialogHeader>
              <ComplaintForm onSubmit={(data) => createMutation.mutate(data)} loading={createMutation.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search complaints..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
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
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                     <TableHead>Category</TableHead>
                     <TableHead>Section</TableHead>
                     <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Complainant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{c.complaint_number}</TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{c.title}</TableCell>
                      <TableCell className="text-sm">{c.category}</TableCell>
                      <TableCell className="text-sm">{(c as any).section || "—"}</TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.priority === "Critical" ? "status-critical" :
                          c.priority === "High" ? "status-open" : "bg-muted text-muted-foreground"
                        }`}>{c.priority}</span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          c.status === "Open" ? "status-open" :
                          c.status === "In Progress" ? "status-in-progress" :
                          c.status === "Resolved" ? "status-resolved" : "status-closed"
                        }`}>{c.status}</span>
                      </TableCell>
                      <TableCell className="text-sm">{c.complainant_name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setEditComplaint(c)}>Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editComplaint} onOpenChange={(o) => !o && setEditComplaint(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Complaint {editComplaint?.complaint_number}</DialogTitle>
          </DialogHeader>
          {editComplaint && (
            <ComplaintForm
              initial={editComplaint}
              showStatus
              onSubmit={(data) => updateMutation.mutate({ ...data, id: editComplaint.id })}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function ComplaintForm({
  initial,
  showStatus,
  onSubmit,
  loading,
}: {
  initial?: Partial<Complaint>;
  showStatus?: boolean;
  onSubmit: (data: Partial<Complaint>) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    category: initial?.category || "AC not working",
    section: (initial as any)?.section || "ANS ATS",
    priority: initial?.priority || "Medium",
    status: initial?.status || "Open",
    complainant_name: initial?.complainant_name || "",
    complainant_email: initial?.complainant_email || "",
    complainant_phone: initial?.complainant_phone || "",
    resolution_notes: initial?.resolution_notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      {showStatus && (
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
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
      {showStatus && (
        <div className="space-y-2">
          <Label>Resolution Notes</Label>
          <Textarea value={form.resolution_notes} onChange={(e) => setForm({ ...form, resolution_notes: e.target.value })} rows={3} />
        </div>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving..." : initial ? "Update Complaint" : "Create Complaint"}
      </Button>
    </form>
  );
}

export default ComplaintsPage;
