import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
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
        <h2 className="text-2xl font-bold" style={{ color: '#0F1F17' }}>Profile Settings</h2>
        <p style={{ color: '#64748B' }}>Manage your account details</p>
      </div>

      <div className="rounded-[10px] p-6" style={{ background: '#FFFFFF', border: '1px solid #E4E8DD' }}>
        <div className="flex items-center gap-2 mb-5">
          <User className="h-4 w-4" style={{ color: '#65A30D' }} />
          <h3 className="text-base font-semibold" style={{ color: '#0F1F17' }}>Profile Information</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label style={{ color: '#475569' }}>Full Name</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              style={{ background: '#FFFFFF', border: '1px solid #E4E8DD', color: '#0F1F17', borderRadius: '7px' }}
            />
          </div>
          <div className="space-y-2">
            <Label style={{ color: '#475569' }}>Login ID</Label>
            <Input value={user?.email || ""} disabled style={{ background: '#0F2A1E', border: '1px solid #E4E8DD', color: '#64748B', borderRadius: '7px' }} />
          </div>

          <div className="space-y-2">
            <Label style={{ color: '#475569' }}>Email Address</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="your.email@example.com"
              style={{ background: '#FFFFFF', border: '1px solid #E4E8DD', color: '#0F1F17', borderRadius: '7px' }}
            />
            <p className="text-xs" style={{ color: '#94A3B8' }}>Used for email notifications</p>
          </div>

          <div className="flex items-center justify-between rounded-lg p-3" style={{ border: '1px solid #E4E8DD' }}>
            <div className="space-y-0.5">
              <Label className="text-sm font-medium" style={{ color: '#0F1F17' }}>Email Notifications</Label>
              <p className="text-xs" style={{ color: '#94A3B8' }}>
                Receive email notifications for complaint updates and assignments
              </p>
            </div>
            <Switch
              checked={form.email_notifications}
              onCheckedChange={(checked) => setForm({ ...form, email_notifications: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label style={{ color: '#475569' }}>Mobile Number</Label>
            <Input
              value={form.mobile_number}
              onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
              placeholder="+92 3XX XXXXXXX (include country code)"
              style={{ background: '#FFFFFF', border: '1px solid #E4E8DD', color: '#0F1F17', borderRadius: '7px' }}
            />
            <p className="text-xs" style={{ color: '#94A3B8' }}>Required to receive SMS notifications</p>
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <Label style={{ color: '#475569' }}>Daily Alert Time</Label>
              <Input
                type="time"
                value={form.daily_alert_time}
                onChange={(e) => setForm({ ...form, daily_alert_time: e.target.value })}
                style={{ background: '#FFFFFF', border: '1px solid #E4E8DD', color: '#0F1F17', borderRadius: '7px' }}
              />
              <p className="text-xs" style={{ color: '#94A3B8' }}>Daily low stock summary will be sent at this time</p>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full font-bold rounded-[7px]"
            style={{ background: '#65A30D', color: '#F7F8F4' }}
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : "Save Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
