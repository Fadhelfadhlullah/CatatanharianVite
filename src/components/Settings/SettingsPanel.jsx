import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { 
  Settings, 
  X, 
  Palette, 
  Type, 
  Layout,
  Save,
  RotateCcw,
  Monitor,
  Sun,
  Moon
} from 'lucide-react';

const SettingsPanel = ({ isOpen, onClose, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      theme: 'light',
      fontSize: 14,
      fontFamily: 'system-ui',
      autoSave: true,
      showWordCount: true,
      defaultCategory: 'Umum',
      notesPerPage: 12,
      animationsEnabled: true,
    };
    setLocalSettings(defaultSettings);
  };

  const updateSetting = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Pengaturan</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Theme Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <h3 className="font-medium">Tema & Tampilan</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tema</label>
                <div className="flex gap-2">
                  <Button
                    variant={localSettings.theme === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('theme', 'light')}
                    className="flex items-center gap-2"
                  >
                    <Sun className="h-4 w-4" />
                    Terang
                  </Button>
                  <Button
                    variant={localSettings.theme === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('theme', 'dark')}
                    className="flex items-center gap-2"
                  >
                    <Moon className="h-4 w-4" />
                    Gelap
                  </Button>
                  <Button
                    variant={localSettings.theme === 'system' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('theme', 'system')}
                    className="flex items-center gap-2"
                  >
                    <Monitor className="h-4 w-4" />
                    Sistem
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Animasi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localSettings.animationsEnabled}
                    onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Aktifkan animasi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Typography Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <h3 className="font-medium">Tipografi</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium mb-2">Ukuran Font Default</label>
                <Select
                  value={localSettings.fontSize}
                  onChange={(e) => updateSetting('fontSize', Number(e.target.value))}
                >
                  <option value={12}>12px - Kecil</option>
                  <option value={14}>14px - Normal</option>
                  <option value={16}>16px - Sedang</option>
                  <option value={18}>18px - Besar</option>
                  <option value={20}>20px - Sangat Besar</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Font Family</label>
                <Select
                  value={localSettings.fontFamily}
                  onChange={(e) => updateSetting('fontFamily', e.target.value)}
                >
                  <option value="system-ui">System UI</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                  <option value="cursive">Cursive</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Layout Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              <h3 className="font-medium">Layout & Tampilan</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium mb-2">Catatan per Halaman</label>
                <Select
                  value={localSettings.notesPerPage}
                  onChange={(e) => updateSetting('notesPerPage', Number(e.target.value))}
                >
                  <option value={6}>6 catatan</option>
                  <option value={12}>12 catatan</option>
                  <option value={18}>18 catatan</option>
                  <option value={24}>24 catatan</option>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Kategori Default</label>
                <Select
                  value={localSettings.defaultCategory}
                  onChange={(e) => updateSetting('defaultCategory', e.target.value)}
                >
                  <option value="Umum">Umum</option>
                  <option value="Kuliah">Kuliah</option>
                  <option value="Kerja">Kerja</option>
                  <option value="Pribadi">Pribadi</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Functionality Settings */}
          <div className="space-y-3">
            <h3 className="font-medium">Fungsionalitas</h3>
            <div className="space-y-3 ml-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localSettings.autoSave}
                  onChange={(e) => updateSetting('autoSave', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Auto-save catatan</span>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localSettings.showWordCount}
                  onChange={(e) => updateSetting('showWordCount', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Tampilkan jumlah kata</span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="space-y-3">
            <h3 className="font-medium">Keyboard Shortcuts</h3>
            <div className="ml-6 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div className="flex justify-between">
                <span>Bold:</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl + B</code>
              </div>
              <div className="flex justify-between">
                <span>Italic:</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl + I</code>
              </div>
              <div className="flex justify-between">
                <span>Underline:</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl + U</code>
              </div>
              <div className="flex justify-between">
                <span>Save:</span>
                <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Ctrl + S</code>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Simpan Pengaturan
            </Button>
            <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset ke Default
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
