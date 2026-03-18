import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Plus, Package, Search, Edit, CalendarIcon, AlertTriangle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const UNITS = ["Pcs", "Meters", "Kg", "Rolls", "Sets"];

const InventoryPage = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [logFilter, setLogFilter] = useState({ direction: "all", item: "all" });

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase.from("inventory").select("*").order("item_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: stockLogs = [] } = useQuery({
    queryKey: ["stock-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("stock_log").select("*").order("logged_at", { ascending: false });
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

  const profileMap = Object.fromEntries(profiles.map((p: any) => [p.user_id, p]));
  const inventoryMap = Object.fromEntries(inventory.map((i: any) => [i.id, i]));
  const categories = [...new Set(inventory.map((i: any) => i.category))].sort();

  const filtered = inventory.filter((i: any) =>
    !search || i.item_name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockItems = inventory.filter((i: any) => i.current_stock <= i.min_level);

  const filteredLogs = stockLogs.filter((l: any) => {
    if (logFilter.direction !== "all" && l.direction !== logFilter.direction) return false;
    if (logFilter.item !== "all" && l.item_id !== logFilter.item) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Inventory Management</h2>
          <p className="text-muted-foreground">Track stock levels and consumption</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setAddItemOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add New Item
            </Button>
            <Button size="sm" variant="outline" className="border-[hsl(var(--status-resolved))] text-[hsl(var(--status-resolved))]" onClick={() => setAddStockOpen(true)}>
              <Package className="h-4 w-4 mr-1" /> Add Stock
            </Button>
          </div>
        )}
      </div>

      {isAdmin && (
        <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
            SMS stock alerts not configured. Connect Twilio and set super admin mobile number to enable low stock alerts.
          </AlertDescription>
        </Alert>
      )}

      {lowStockItems.length > 0 && (
        <Alert className="border-destructive/30 bg-destructive/5">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive text-sm">
            {lowStockItems.length} item(s) below minimum level: {lowStockItems.slice(0, 3).map((i: any) => i.item_name).join(", ")}{lowStockItems.length > 3 ? "..." : ""}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="history">Stock History</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="text-right">In Stock</TableHead>
                        <TableHead className="text-right">Min Level</TableHead>
                        <TableHead className="text-right">Total In</TableHead>
                        <TableHead className="text-right">Total Used</TableHead>
                        <TableHead>Status</TableHead>
                        {isAdmin && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((item: any) => {
                        const low = item.current_stock <= item.min_level;
                        return (
                          <TableRow key={item.id} className={low ? "bg-destructive/5" : ""}>
                            <TableCell className="font-medium">{item.item_name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.category}</TableCell>
                            <TableCell className="text-sm">{item.unit}</TableCell>
                            <TableCell className={`text-right font-semibold ${low ? "text-destructive" : ""}`}>{Number(item.current_stock)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{Number(item.min_level)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{Number(item.total_inward)}</TableCell>
                            <TableCell className="text-right text-muted-foreground">{Number(item.total_consumed)}</TableCell>
                            <TableCell>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${low ? "status-critical" : "status-resolved"}`}>
                                {low ? "Low Stock" : "OK"}
                              </span>
                            </TableCell>
                            {isAdmin && (
                              <TableCell>
                                <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => setEditItem(item)}>
                                  <Edit className="h-3 w-3 mr-1" /> Edit
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex gap-3">
            <Select value={logFilter.direction} onValueChange={(v) => setLogFilter({ ...logFilter, direction: v })}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Direction" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Directions</SelectItem>
                <SelectItem value="Inward">Inward</SelectItem>
                <SelectItem value="Outward">Outward</SelectItem>
              </SelectContent>
            </Select>
            <Select value={logFilter.item} onValueChange={(v) => setLogFilter({ ...logFilter, item: v })}>
              <SelectTrigger className="w-[220px]"><SelectValue placeholder="Item" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                {inventory.map((i: any) => <SelectItem key={i.id} value={i.id}>{i.item_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Supplier / Location</TableHead>
                      <TableHead>Complaint</TableHead>
                      <TableHead>Logged By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No stock history found.</TableCell></TableRow>
                    ) : filteredLogs.slice(0, 100).map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">{new Date(log.logged_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium text-sm">{inventoryMap[log.item_id]?.item_name || "—"}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${log.direction === "Inward" ? "status-resolved" : "status-open"}`}>
                            {log.direction}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{Number(log.qty)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.supplier || "—"}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{log.complaint_id ? log.complaint_id.slice(0, 8) + "..." : "—"}</TableCell>
                        <TableCell className="text-sm">{profileMap[log.used_by]?.full_name || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add New Item Modal */}
      <AddItemModal open={addItemOpen} onClose={() => setAddItemOpen(false)} categories={categories} onSaved={() => queryClient.invalidateQueries({ queryKey: ["inventory"] })} />

      {/* Add Stock Modal */}
      <AddStockModal open={addStockOpen} onClose={() => setAddStockOpen(false)} inventory={inventory} userId={user?.id} onSaved={() => { queryClient.invalidateQueries({ queryKey: ["inventory"] }); queryClient.invalidateQueries({ queryKey: ["stock-logs"] }); }} />

      {/* Edit Item Modal */}
      {editItem && (
        <EditItemModal item={editItem} open={!!editItem} onClose={() => setEditItem(null)} categories={categories} onSaved={() => queryClient.invalidateQueries({ queryKey: ["inventory"] })} />
      )}
    </div>
  );
};

function AddItemModal({ open, onClose, categories, onSaved }: { open: boolean; onClose: () => void; categories: string[]; onSaved: () => void }) {
  const [form, setForm] = useState({ item_name: "", category: "Electrical", unit: "Pcs", initial_qty: "0", min_level: "5" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.item_name.trim()) { toast.error("Item name is required"); return; }
    setSaving(true);
    try {
      const qty = Number(form.initial_qty) || 0;
      const { error } = await supabase.from("inventory").insert({
        item_name: form.item_name.trim(),
        category: form.category,
        unit: form.unit,
        current_stock: qty,
        total_inward: qty,
        min_level: Number(form.min_level) || 5,
      } as any);
      if (error) throw error;
      toast.success("Item added successfully");
      onSaved();
      onClose();
      setForm({ item_name: "", category: "Electrical", unit: "Pcs", initial_qty: "0", min_level: "5" });
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add New Inventory Item</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Item Name *</Label>
            <Input value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[...new Set([...categories, "Electrical", "Lighting", "Wiring", "HVAC", "Accessories", "Tools"])].sort().map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Initial Quantity</Label>
              <Input type="number" min="0" value={form.initial_qty} onChange={(e) => setForm({ ...form, initial_qty: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Minimum Level</Label>
              <Input type="number" min="0" value={form.min_level} onChange={(e) => setForm({ ...form, min_level: e.target.value })} />
            </div>
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Item"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddStockModal({ open, onClose, inventory, userId, onSaved }: { open: boolean; onClose: () => void; inventory: any[]; userId?: string; onSaved: () => void }) {
  const [form, setForm] = useState({ item_id: "", qty: "1", supplier: "", remarks: "", date_received: new Date() });
  const [saving, setSaving] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const handleSubmit = async () => {
    if (!form.item_id) { toast.error("Select an item"); return; }
    const qty = Number(form.qty);
    if (qty < 1) { toast.error("Quantity must be at least 1"); return; }
    setSaving(true);
    try {
      const item = inventory.find((i: any) => i.id === form.item_id);
      if (!item) throw new Error("Item not found");

      // Update inventory
      const { error: updErr } = await supabase.from("inventory").update({
        current_stock: Number(item.current_stock) + qty,
        total_inward: Number(item.total_inward) + qty,
      } as any).eq("id", item.id);
      if (updErr) throw updErr;

      // Log inward
      const { error: logErr } = await supabase.from("stock_log").insert({
        item_id: item.id,
        qty,
        direction: "Inward",
        used_by: userId,
        supplier: form.supplier || null,
        remarks: form.remarks || null,
        date_received: format(form.date_received, "yyyy-MM-dd"),
      } as any);
      if (logErr) throw logErr;

      toast.success(`${item.item_name} stock updated. New level: ${Number(item.current_stock) + qty}`);
      onSaved();
      onClose();
      setForm({ item_id: "", qty: "1", supplier: "", remarks: "", date_received: new Date() });
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add Stock (Inward)</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Item *</Label>
            <Select value={form.item_id} onValueChange={(v) => setForm({ ...form, item_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select item..." /></SelectTrigger>
              <SelectContent>
                {inventory.map((i: any) => <SelectItem key={i.id} value={i.id}>{i.item_name} — {Number(i.current_stock)} {i.unit} in stock</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantity *</Label>
            <Input type="number" min="1" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Supplier / Source</Label>
            <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="e.g. Asif Sarhandi, Local supplier" />
          </div>
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Date Received</Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.date_received && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(form.date_received, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={form.date_received} onSelect={(d) => { if (d) { setForm({ ...form, date_received: d }); setDateOpen(false); } }} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleSubmit} disabled={saving} className="w-full bg-[hsl(var(--status-resolved))] hover:bg-[hsl(145,63%,35%)] text-white">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Inward Entry"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditItemModal({ item, open, onClose, categories, onSaved }: { item: any; open: boolean; onClose: () => void; categories: string[]; onSaved: () => void }) {
  const [form, setForm] = useState({ item_name: item.item_name, category: item.category, unit: item.unit, min_level: String(item.min_level) });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.item_name.trim()) { toast.error("Item name is required"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("inventory").update({
        item_name: form.item_name.trim(),
        category: form.category,
        unit: form.unit,
        min_level: Number(form.min_level) || 5,
      } as any).eq("id", item.id);
      if (error) throw error;
      toast.success("Item updated");
      onSaved();
      onClose();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Edit Item</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Item Name *</Label>
            <Input value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[...new Set([...categories, "Electrical", "Lighting", "Wiring", "HVAC", "Accessories", "Tools"])].sort().map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Minimum Level</Label>
            <Input type="number" min="0" value={form.min_level} onChange={(e) => setForm({ ...form, min_level: e.target.value })} />
          </div>
          <p className="text-xs text-muted-foreground">Current stock ({Number(item.current_stock)} {item.unit}) is calculated automatically and cannot be manually changed.</p>
          <Button onClick={handleSubmit} disabled={saving} className="w-full">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default InventoryPage;
