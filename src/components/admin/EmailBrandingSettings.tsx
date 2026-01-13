import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Palette, 
  Image, 
  Type, 
  Save, 
  RotateCcw, 
  Eye, 
  Upload,
  Mail,
  FileText
} from 'lucide-react';

interface BrandingSettings {
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  headerText: string;
  footerText: string;
  supportEmail: string;
  websiteUrl: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  customCss?: string;
}

const DEFAULT_SETTINGS: BrandingSettings = {
  brandName: 'MiniDrama',
  primaryColor: '#8b5cf6',
  secondaryColor: '#6366f1',
  logoUrl: '',
  headerText: '',
  footerText: '© {year} {brandName}. All rights reserved.',
  supportEmail: 'support@minidrama.app',
  websiteUrl: 'https://minidrama.app',
  socialLinks: {},
  customCss: ''
};

export const EmailBrandingSettings = () => {
  const [settings, setSettings] = useState<BrandingSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('email_branding_settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse branding settings:', e);
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('email_branding_settings', JSON.stringify(settings));
      toast.success('Branding settings saved successfully');
    } catch (error) {
      toast.error('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.info('Settings reset to defaults');
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.error('Logo must be less than 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSettings(prev => ({ ...prev, logoUrl: dataUrl }));
      toast.success('Logo uploaded');
    };
    reader.readAsDataURL(file);
  };

  const updateSetting = <K extends keyof BrandingSettings>(
    key: K,
    value: BrandingSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const processFooterText = (text: string) => {
    return text
      .replace('{year}', new Date().getFullYear().toString())
      .replace('{brandName}', settings.brandName);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Email Branding Settings
          </h2>
          <p className="text-muted-foreground">
            Customize the look and feel of security email notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Brand Identity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Type className="h-5 w-5" />
                Brand Identity
              </CardTitle>
              <CardDescription>
                Basic branding elements for your emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={settings.brandName}
                  onChange={(e) => updateSetting('brandName', e.target.value)}
                  placeholder="Your Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => updateSetting('supportEmail', e.target.value)}
                  placeholder="support@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={settings.websiteUrl}
                  onChange={(e) => updateSetting('websiteUrl', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Image className="h-5 w-5" />
                Logo
              </CardTitle>
              <CardDescription>
                Upload your company logo (max 500KB, PNG or JPG recommended)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
              
              {settings.logoUrl ? (
                <div className="relative">
                  <div className="p-4 bg-muted/30 rounded-lg flex items-center justify-center">
                    <img 
                      src={settings.logoUrl} 
                      alt="Logo preview" 
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Replace
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateSetting('logoUrl', '')}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full h-24 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6" />
                    <span>Click to upload logo</span>
                  </div>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Colors
              </CardTitle>
              <CardDescription>
                Customize the color scheme of your emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border cursor-pointer"
                      style={{ backgroundColor: settings.primaryColor }}
                      onClick={() => document.getElementById('primaryColorPicker')?.click()}
                    />
                    <input
                      id="primaryColorPicker"
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      className="sr-only"
                    />
                    <Input
                      id="primaryColor"
                      value={settings.primaryColor}
                      onChange={(e) => updateSetting('primaryColor', e.target.value)}
                      placeholder="#8b5cf6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg border cursor-pointer"
                      style={{ backgroundColor: settings.secondaryColor }}
                      onClick={() => document.getElementById('secondaryColorPicker')?.click()}
                    />
                    <input
                      id="secondaryColorPicker"
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                      className="sr-only"
                    />
                    <Input
                      id="secondaryColor"
                      value={settings.secondaryColor}
                      onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Text */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Custom Text
              </CardTitle>
              <CardDescription>
                Add custom header and footer text to emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headerText">Header Text (optional)</Label>
                <Input
                  id="headerText"
                  value={settings.headerText}
                  onChange={(e) => updateSetting('headerText', e.target.value)}
                  placeholder="e.g., Security Team"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Textarea
                  id="footerText"
                  value={settings.footerText}
                  onChange={(e) => updateSetting('footerText', e.target.value)}
                  placeholder="© {year} {brandName}. All rights reserved."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{year}'} for current year and {'{brandName}'} for your brand name
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Social Links (Optional)
              </CardTitle>
              <CardDescription>
                Add social media links to email footers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X URL</Label>
                <Input
                  id="twitter"
                  value={settings.socialLinks.twitter || ''}
                  onChange={(e) => updateSetting('socialLinks', { 
                    ...settings.socialLinks, 
                    twitter: e.target.value 
                  })}
                  placeholder="https://twitter.com/yourcompany"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={settings.socialLinks.linkedin || ''}
                  onChange={(e) => updateSetting('socialLinks', { 
                    ...settings.socialLinks, 
                    linkedin: e.target.value 
                  })}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  value={settings.socialLinks.github || ''}
                  onChange={(e) => updateSetting('socialLinks', { 
                    ...settings.socialLinks, 
                    github: e.target.value 
                  })}
                  placeholder="https://github.com/yourcompany"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Email Preview
              </CardTitle>
              <CardDescription>
                Preview how your security emails will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="rounded-lg overflow-hidden border"
                style={{ backgroundColor: '#0a0a0a' }}
              >
                {/* Email Preview */}
                <div className="p-6 max-w-md mx-auto">
                  {/* Header */}
                  <div className="text-center mb-6">
                    {settings.logoUrl ? (
                      <img 
                        src={settings.logoUrl} 
                        alt="Logo" 
                        className="h-10 mx-auto mb-3"
                      />
                    ) : (
                      <p 
                        className="text-xl font-bold mb-2"
                        style={{ color: settings.primaryColor }}
                      >
                        🛡️ {settings.brandName}
                      </p>
                    )}
                    {settings.headerText && (
                      <p className="text-gray-400 text-sm">{settings.headerText}</p>
                    )}
                  </div>

                  {/* Content */}
                  <div className="bg-gray-900 rounded-lg p-5 mb-6">
                    <h2 className="text-white text-lg font-semibold mb-3">
                      Security Daily Digest
                    </h2>
                    <p className="text-gray-300 text-sm mb-4">
                      Here's your security summary for the past 24 hours.
                    </p>
                    
                    {/* Sample Metrics */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-800 rounded p-3 text-center">
                        <p className="text-2xl font-bold text-white">12</p>
                        <p className="text-xs text-gray-400">Total Events</p>
                      </div>
                      <div className="bg-gray-800 rounded p-3 text-center">
                        <p className="text-2xl font-bold text-red-400">2</p>
                        <p className="text-xs text-gray-400">Warnings</p>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <a 
                      href="#"
                      className="block text-center text-white font-semibold py-3 rounded-lg"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      View Dashboard
                    </a>
                  </div>

                  <Separator className="my-4 bg-gray-700" />

                  {/* Footer */}
                  <div className="text-center">
                    <p className="text-gray-500 text-xs mb-2">
                      {processFooterText(settings.footerText)}
                    </p>
                    <p className="text-gray-600 text-xs">
                      <a 
                        href="#" 
                        style={{ color: settings.primaryColor }}
                      >
                        Unsubscribe
                      </a>
                      {' | '}
                      <a 
                        href="#" 
                        style={{ color: settings.primaryColor }}
                      >
                        Preferences
                      </a>
                    </p>
                    
                    {/* Social Links */}
                    {(settings.socialLinks.twitter || settings.socialLinks.linkedin || settings.socialLinks.github) && (
                      <div className="flex justify-center gap-4 mt-3">
                        {settings.socialLinks.twitter && (
                          <span className="text-gray-500 text-xs">Twitter</span>
                        )}
                        {settings.socialLinks.linkedin && (
                          <span className="text-gray-500 text-xs">LinkedIn</span>
                        )}
                        {settings.socialLinks.github && (
                          <span className="text-gray-500 text-xs">GitHub</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
