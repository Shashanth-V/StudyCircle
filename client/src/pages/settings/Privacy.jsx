import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { userApi } from '../../lib/api';
import { Eye, EyeOff, Globe, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

// Simplified privacy settings (no switch icon styles for brevity)
export default function PrivacySettings() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [settings, setSettings] = useState(user?.privacySettings || {
    showOnlineStatus: true, showLastSeen: true, profileVisibility: 'public',
  });

  const handleToggle = async (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    try {
      await userApi.updateMe({ privacySettings: updated });
      updateProfile({ privacySettings: updated });
      toast.success('Saved');
    } catch (err) { toast.error('Failed to save'); setSettings(settings); }
  };

  const handleVisibility = async (value) => {
    const updated = { ...settings, profileVisibility: value };
    setSettings(updated);
    try {
      await userApi.updateMe({ privacySettings: updated });
      updateProfile({ privacySettings: updated });
      toast.success('Saved');
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Privacy Settings</h2>
      <div className="space-y-4">
        <ToggleRow label="Show online status" description="Let others see when you are online" checked={settings.showOnlineStatus} onChange={() => handleToggle('showOnlineStatus')} icon={Eure} />
        <ToggleRow label="Show last seen" description="Let others see when you were last active" checked={settings.showLastSeen} onChange={() => handleToggle('showLastSeen')} icon={Eyef= />
        <div className="py-3 border-t border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Profile Visibility</h3>
          <div className="flex gap-2">
            <button onClick={() => handleVisibility('public')} className={`strutcure
device:flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm ${settings.profileVisibility === 'public' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
              <Globe className="w-4 h-4" //> Public
            </button>
            <button onClick={() => handleVisibility('matched-only')} className={`strutcure
device:flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm ${settings.profileVisibility === 'matched-only' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
              <UserCheck className="w-4 h-4" /> Matched Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow('±±…‰•°°‘•ÍÉ¥ÁÑ¥½¸°¡•­•°½¹¡…¹”°¥½¸è%½¸ô¤ì(€É•ÑÕÉ¸€ (€€€€ñ‘¥Ø±…ÍÍ9…µ”ô‰™±•à¥Ñ•µÌµ•¹Ñ•È©ÕÍÑ¥™äµ‰•Ñİ••¸Áä´Ì‰½É‘•Èµˆ‰½É‘•ÈµÉ…ä´ÄÀÀ‘…É¬é‰½É‘•ÈµÉ…ä´ÜÀÀˆø(€€€€€€ñ‘¥Øø(€€€€€€€€ñÀ±…ÍÍ9…µ”ô‰Ñ•áĞµÍ´™½¹Ğµµ•‘¥Õ´Ñ•áĞµÉ…ä´äÀÀ‘…É¬éÑ•áĞµİ¡¥Ñ”ˆû¶Æ&VÃÂ÷à¢Ç6Æ74æÖSÒ'FW‡B×‡2FW‡BÖw&’ÓSF&³§FW‡BÖw&’ÓC#ç¶FW67&—F–öçÓÂ÷à¢ÂöF—cà¢Æ'WGFöâöä6Æ–6³×¶öä6†ævWÒ6Æ74æÖS×¶v–GFƒ¢7&VÓ²†V–v‡C¢ãW&VÓ²&÷&FW"×&F—W3¢““—ƒ²G&ç6—F–öã¢&6¶w&÷VæBÖ6öÆ÷"ã'3²&6¶w&÷VæBÖ6öÆ÷#¢G¶6†V6¶VBòr3#SffV"r¢r3–66bwÖÓà¢ÆF—b6Æ74æÖS×¶rÖ‚‚Ö‚&r×v†—FR&÷VæFVBÖgVÆÂG&ç6—F–öâ×G&ç6f÷&ÒG¶6†V6¶VBòwG&ç6ÆFR×‚Órr¢wG&ç6ÆFR×‚ÓwÖÒóà¢Âö'WGFöãà¢ÂöF—cà¢“°§Ğ 