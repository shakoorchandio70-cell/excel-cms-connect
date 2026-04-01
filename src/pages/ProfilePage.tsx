import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, User } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const { profile, isAdmin } = useUserRole();
  const [form, setForm] = useState({
    full_name: "",
    mobile_number: "",
    email: "",
    email_notifications: true,
    daily_alert_time: "08:00",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        mobile_number: (profile as any).mobile_number || "",
        email: (profile as any).email || user?.email || "",
        email_notifications: (profile as any).email_notifications !== false,
        daily_alert_time: (profile as any).daily_alert_time || "08:00",
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: form.full_name,
        mobile_number: form.mobile_number || null,
        email: form.email || null,
        email_notifications: form.email_notifications,
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

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Profile Settings</h2>
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

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your.email@example.com"
            />
            <p className="text-xs text-muted-foreground">Used for email notifications</p>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive email notifications for complaint updates and assignments
              </p>
            </div>
            <Switch
              checked={form.email_notifications}
              onCheckedChange={(checked) => setForm({ ...form, email_notifications: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label>Mobile Number</Label>
            <Input
              value={form.mobile_number}
              onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
              placeholder="+92 3XX XXXXXXX (include country code)"
            />
            <p className="text-xs text-muted-foreground">Required to receive SMS notifications</p>
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <Label>Daily Alert Time</Label>
              <Input
                type="time"
                value={form.daily_alert_time}
                onChange={(e) => setForm({ ...form, daily_alert_time: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Daily low stock summary will be sent at this time</p>
            </div>
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
