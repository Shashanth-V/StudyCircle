import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { userApi } from "../../lib/api";
import { Bell, Mail, MessageSquare, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function NotificationSettings() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [prefs, setPrefs] = useState(user?.notificationPrefs || {
    emailMatchRequest: true, emailMessage: true, emailSessionInvite: true,
    inAppMatchRequest: true, inAppMessage: true, inAppSessionInvite: true,
  });
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try {
      await userApi.updateMe({ notificationPrefs: updated });
      updateProfile({ notificationPrefs: updated });
      toast.success("Saved");
    } catch (err) {
      toast.error("Failed to save");
      setPrefs(prefs);
    } finally {
      setSaving(false);
    }
  };

  const ToggleRow = ({ label, emailKey, inAppKey, icon: Icon }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-900 dark:text-white">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
          <Mail className="w-3.5 h-3.5" />
          <input type="checkbox" checked={prefs[emailKey]} onChange={() => handleToggle(emailKey)} className="rounded" />
          Email
        </label>
        <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
          <Bell className="w-3.5 h-3.5" />
          <input type="checkbox" checked={prefs[inAppKey]} onChange={() => handleToggle(inAppKey)} className="rounded" />
          In-app
        </label>
      </div>
    </div>
  );

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Notification Preferences</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{saving ? "Saving..." : "Choose how you want to be notified"}</p>
      <ToggleRow label="Match Requests" emailKey="emailMatchRequest" inAppKey="inAppMatchRequest" icon={Users} />
      <ToggleRow label="Messages" emailKey="emailMessage" inAppKey="inAppMessage" icon={MessageSquare} />
      <ToggleRow label="Session Invites" emailKey="emailSessionInvite" inAppKey="inAppSessionInvite" icon={Bell} />
    </div>
  );
}
