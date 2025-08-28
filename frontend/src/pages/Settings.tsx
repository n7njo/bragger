import { useState } from 'react';
import { Save, User, Bell, Shield, Palette, Download, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';

interface UserPreferences {
  displayName: string;
  email: string;
  timezone: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
}

export function Settings() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    displayName: 'John Doe',
    email: 'john.doe@example.com',
    timezone: 'America/New_York',
    dateFormat: 'MM/dd/yyyy',
    theme: 'system',
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // In a real app, you'd make an API call here
    console.log('Saving preferences:', preferences);
  };

  const handleExportData = () => {
    // Create a mock data export
    const data = {
      preferences,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bragger-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    // In a real app, this would delete the user's account
    console.log('Account deletion requested');
    setShowDeleteModal(false);
  };

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
    { value: 'America/Chicago', label: 'Central Time (UTC-6)' },
    { value: 'America/Denver', label: 'Mountain Time (UTC-7)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)' },
    { value: 'Europe/London', label: 'GMT (UTC+0)' },
    { value: 'Europe/Paris', label: 'CET (UTC+1)' },
    { value: 'Asia/Tokyo', label: 'JST (UTC+9)' },
  ];

  const dateFormatOptions = [
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (12/31/2023)' },
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (31/12/2023)' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (2023-12-31)' },
    { value: 'MMM dd, yyyy', label: 'MMM DD, YYYY (Dec 31, 2023)' },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System Default' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="h-8 w-8 mr-3 text-primary-600" />
          Settings
        </h1>
        <p className="mt-2 text-gray-600">Manage your account and application preferences</p>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <div className="card">
          <div className="flex items-center mb-6">
            <User className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Display Name"
              value={preferences.displayName}
              onChange={(e) => setPreferences(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Enter your display name"
            />
            
            <Input
              label="Email"
              type="email"
              value={preferences.email}
              onChange={(e) => setPreferences(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email address"
            />
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Palette className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Appearance & Localization</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              label="Theme"
              value={preferences.theme}
              onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value as any }))}
              options={themeOptions}
            />
            
            <Select
              label="Timezone"
              value={preferences.timezone}
              onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
              options={timezoneOptions}
            />
            
            <Select
              label="Date Format"
              value={preferences.dateFormat}
              onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
              options={dateFormatOptions}
            />
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Bell className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Email notifications for new achievements</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.pushNotifications}
                onChange={(e) => setPreferences(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Push notifications (browser)</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.weeklyDigest}
                onChange={(e) => setPreferences(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-3 text-sm text-gray-700">Weekly achievement digest</span>
            </label>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="card">
          <div className="flex items-center mb-6">
            <Shield className="h-5 w-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Data & Privacy</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Export Your Data</h3>
                <p className="text-sm text-gray-600">Download a copy of your achievements and settings</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h3 className="text-sm font-medium text-red-900">Delete Account</h3>
                <p className="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button 
            onClick={handleSave} 
            loading={isSaving}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="sm"
      >
        <div>
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-gray-600 mb-6 text-center">
            Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your achievements and data.
          </p>
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}