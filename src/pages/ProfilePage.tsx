import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, isAdmin } = useUserRole();
  const [form, setForm] = useState({
    full_name: "",
    mobile_number: "",
    daily_alert_time: "08:00",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        mobile_number: (profile as any).mobile_number || "",
        daily_alert_time: (profile as any).daily_alert_time || "08:00",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: form.full_name,
        mobile_number: form.mobile_number || null,
        daily_alert_time: form.daily_alert_time,
        mobile_updated_at: form.mobile_number ? new Date().toISOString() : null,
      } as any).eq("user_id", user!.id);
      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  // Only super admin gets profile settings with mobile/alert time
  const isSuperAdmin = user?.email === "superadmin@cati.local";

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {isSuperAdmin ? "Super Admin Profile" : "Profile Settings"}
        </h2>
        <p className="text-muted-foreground">Manage your account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" /> Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Login ID</Label>
            <Input value={user?.email || ""} disabled className="bg-muted" />
          </div>

          {isSuperAdmin && (
            <>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input
                  value={form.mobile_number}
                  onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
                  placeholder="+92 3XX XXXXXXX (include country code)"
                />
                <p className="text-xs text-muted-foreground">Used for receiving low stock SMS alerts</p>
              </div>
              <div className="space-y-2">
                <Label>Daily Alert Time</Label>
                <Input
                  type="time"
                  value={form.daily_alert_time}
                  onChange={(e) => setForm({ ...form, daily_alert_time: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Daily low stock summary will be sent at this time</p>
              </div>
            </>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full bg-[hsl(var(--status-resolved))] hover:bg-[hsl(145,63%,35%)] text-white">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
