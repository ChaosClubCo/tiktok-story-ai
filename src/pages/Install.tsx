import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Monitor, Share, Download, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Capture the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          ← Back to Home
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Install TikTok Story AI
          </h1>
          <p className="text-muted-foreground text-lg">
            Get instant access from your home screen. Works offline and loads faster!
          </p>
        </div>

        {isInstalled && (
          <Card className="mb-6 border-primary/50 bg-primary/5">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Already Installed!</h3>
              <p className="text-muted-foreground">
                The app is installed and ready to use. You can access it from your home screen.
              </p>
            </CardContent>
          </Card>
        )}

        {isInstallable && !isInstalled && (
          <Card className="mb-6 border-primary bg-gradient-to-br from-primary/10 to-secondary/10">
            <CardContent className="pt-6 text-center">
              <Button 
                size="lg" 
                onClick={handleInstallClick}
                className="w-full sm:w-auto text-lg px-8 py-6"
              >
                <Download className="w-5 h-5 mr-2" />
                Install App Now
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                One-click installation • No app store needed
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className={platform === 'ios' ? 'border-primary' : ''}>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>iOS (Safari)</CardTitle>
              <CardDescription>iPhone & iPad</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Open this page in Safari browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Tap the <Share className="inline w-4 h-4" /> Share button</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Scroll down and tap "Add to Home Screen"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>Tap "Add" to confirm</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className={platform === 'android' ? 'border-primary' : ''}>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Android (Chrome)</CardTitle>
              <CardDescription>Android devices</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Open this page in Chrome browser</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Tap the menu (⋮) button</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Select "Add to Home screen" or "Install app"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>Tap "Install" or "Add" to confirm</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className={platform === 'desktop' ? 'border-primary' : ''}>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Desktop (Chrome/Edge)</CardTitle>
              <CardDescription>Windows, Mac, Linux</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span>Click the <Download className="inline w-4 h-4" /> install icon in the address bar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span>Or open the menu (⋮) and select "Install TikTok Story AI"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span>Click "Install" in the dialog</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span>Mac: Use <Command className="inline w-4 h-4" /> + Shift + A to open apps</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <CardTitle>Why Install?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid sm:grid-cols-2 gap-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Download className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Instant Access</h4>
                  <p className="text-sm text-muted-foreground">Launch directly from your home screen</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Works Offline</h4>
                  <p className="text-sm text-muted-foreground">Access your scripts without internet</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Monitor className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Native Experience</h4>
                  <p className="text-sm text-muted-foreground">Runs like a native app</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Share className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Fast Performance</h4>
                  <p className="text-sm text-muted-foreground">Optimized loading and caching</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Install;
