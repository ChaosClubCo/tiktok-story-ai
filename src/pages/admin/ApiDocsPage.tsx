import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  FileCode, 
  Search, 
  ChevronDown, 
  Copy, 
  Check,
  Lock,
  Unlock,
  Zap,
  Database,
  Shield,
  Video,
  FileText,
  Users,
  Bell,
  Key,
  Activity,
  FlaskConical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ApiTestingSandbox } from '@/components/admin/ApiTestingSandbox';

interface EndpointParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

interface EndpointResponse {
  status: number;
  description: string;
  example?: any;
}

interface ApiEndpoint {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  category: string;
  auth: 'public' | 'user' | 'admin' | 'service';
  params?: EndpointParam[];
  body?: EndpointParam[];
  responses: EndpointResponse[];
  example?: {
    request?: any;
    response?: any;
  };
}

const API_ENDPOINTS: ApiEndpoint[] = [
  // Authentication & Security
  {
    name: 'Login Rate Limit',
    method: 'POST',
    path: '/functions/v1/login-rate-limit',
    description: 'Check and enforce login rate limits with CAPTCHA support',
    category: 'Security',
    auth: 'public',
    body: [
      { name: 'action', type: 'string', required: true, description: '"check" | "record_attempt" | "reset"' },
      { name: 'success', type: 'boolean', required: false, description: 'Whether the login attempt was successful' },
      { name: 'captchaSolved', type: 'boolean', required: false, description: 'Whether CAPTCHA was solved' }
    ],
    responses: [
      { status: 200, description: 'Rate limit status', example: { allowed: true, remainingAttempts: 5, requiresCaptcha: false } },
      { status: 429, description: 'Rate limited', example: { blocked: true, retryAfterSeconds: 900 } }
    ],
    example: {
      request: { action: 'check' },
      response: { allowed: true, blocked: false, remainingAttempts: 8, requiresCaptcha: false }
    }
  },
  {
    name: 'Send Security Alert',
    method: 'POST',
    path: '/functions/v1/send-security-alert',
    description: 'Send email notifications for security events',
    category: 'Security',
    auth: 'service',
    body: [
      { name: 'userId', type: 'string', required: true, description: 'Target user ID' },
      { name: 'alertType', type: 'string', required: true, description: '"login_blocked" | "2fa_enabled" | "2fa_disabled" | "password_changed" | "suspicious_activity"' },
      { name: 'ipAddress', type: 'string', required: false, description: 'Client IP address' },
      { name: 'userAgent', type: 'string', required: false, description: 'Browser user agent' }
    ],
    responses: [
      { status: 200, description: 'Alert sent successfully' },
      { status: 500, description: 'Failed to send alert' }
    ]
  },
  {
    name: 'User 2FA',
    method: 'POST',
    path: '/functions/v1/user-2fa',
    description: 'Manage user two-factor authentication',
    category: 'Security',
    auth: 'user',
    body: [
      { name: 'action', type: 'string', required: true, description: '"setup" | "verify" | "disable" | "status"' },
      { name: 'code', type: 'string', required: false, description: 'TOTP verification code' }
    ],
    responses: [
      { status: 200, description: '2FA action completed' },
      { status: 401, description: 'Unauthorized' }
    ]
  },
  {
    name: 'Admin 2FA',
    method: 'POST',
    path: '/functions/v1/admin-2fa',
    description: 'Admin-specific two-factor authentication',
    category: 'Security',
    auth: 'admin',
    body: [
      { name: 'action', type: 'string', required: true, description: '"setup" | "verify" | "disable" | "status"' },
      { name: 'code', type: 'string', required: false, description: 'TOTP verification code' }
    ],
    responses: [
      { status: 200, description: '2FA action completed' },
      { status: 403, description: 'Admin access required' }
    ]
  },
  {
    name: 'Security Monitor',
    method: 'POST',
    path: '/functions/v1/security-monitor',
    description: 'Log security events for monitoring',
    category: 'Security',
    auth: 'user',
    body: [
      { name: 'eventType', type: 'string', required: true, description: 'Type of security event' },
      { name: 'severity', type: 'string', required: true, description: '"low" | "medium" | "high" | "critical"' },
      { name: 'details', type: 'object', required: false, description: 'Additional event details' }
    ],
    responses: [
      { status: 200, description: 'Event logged' }
    ]
  },
  {
    name: 'Get Security Events',
    method: 'POST',
    path: '/functions/v1/get-security-events',
    description: 'Retrieve security events for monitoring',
    category: 'Security',
    auth: 'admin',
    body: [
      { name: 'limit', type: 'number', required: false, description: 'Max events to return (default: 50)' }
    ],
    responses: [
      { status: 200, description: 'Security events list' }
    ]
  },
  {
    name: 'Get Login Activity',
    method: 'POST',
    path: '/functions/v1/get-login-activity',
    description: 'Retrieve user login history',
    category: 'Security',
    auth: 'user',
    body: [
      { name: 'limit', type: 'number', required: false, description: 'Max records to return' }
    ],
    responses: [
      { status: 200, description: 'Login activity list' }
    ]
  },

  // Scripts & Content
  {
    name: 'Generate Script',
    method: 'POST',
    path: '/functions/v1/generate-script',
    description: 'Generate a viral script using AI',
    category: 'Content',
    auth: 'user',
    body: [
      { name: 'topic', type: 'string', required: true, description: 'Script topic' },
      { name: 'niche', type: 'string', required: true, description: 'Content niche' },
      { name: 'tone', type: 'string', required: true, description: 'Script tone' },
      { name: 'length', type: 'string', required: true, description: '"short" | "medium" | "long"' }
    ],
    responses: [
      { status: 200, description: 'Generated script' },
      { status: 429, description: 'Rate limited' }
    ]
  },
  {
    name: 'Analyze Script',
    method: 'POST',
    path: '/functions/v1/analyze-script',
    description: 'Analyze script for viral potential',
    category: 'Content',
    auth: 'user',
    body: [
      { name: 'content', type: 'string', required: true, description: 'Script content to analyze' },
      { name: 'niche', type: 'string', required: false, description: 'Content niche for context' }
    ],
    responses: [
      { status: 200, description: 'Analysis with viral score and metrics' }
    ]
  },
  {
    name: 'Save Script',
    method: 'POST',
    path: '/functions/v1/save-script',
    description: 'Save a script to the database',
    category: 'Content',
    auth: 'user',
    body: [
      { name: 'title', type: 'string', required: true, description: 'Script title' },
      { name: 'content', type: 'string', required: true, description: 'Script content' },
      { name: 'niche', type: 'string', required: true, description: 'Content niche' },
      { name: 'tone', type: 'string', required: true, description: 'Script tone' },
      { name: 'length', type: 'string', required: true, description: 'Script length' }
    ],
    responses: [
      { status: 200, description: 'Saved script with ID' }
    ]
  },
  {
    name: 'Get User Scripts',
    method: 'POST',
    path: '/functions/v1/get-user-scripts',
    description: 'Retrieve user\'s saved scripts',
    category: 'Content',
    auth: 'user',
    responses: [
      { status: 200, description: 'List of user scripts' }
    ]
  },

  // Branching & Versioning
  {
    name: 'Create Branch',
    method: 'POST',
    path: '/functions/v1/create-branch',
    description: 'Create a new script branch',
    category: 'Versioning',
    auth: 'user',
    body: [
      { name: 'scriptId', type: 'string', required: true, description: 'Parent script ID' },
      { name: 'branchName', type: 'string', required: true, description: 'Name for new branch' }
    ],
    responses: [
      { status: 200, description: 'Created branch' }
    ]
  },
  {
    name: 'Merge Branch',
    method: 'POST',
    path: '/functions/v1/merge-branch',
    description: 'Merge a branch back to main',
    category: 'Versioning',
    auth: 'user',
    body: [
      { name: 'branchId', type: 'string', required: true, description: 'Branch to merge' },
      { name: 'targetBranchId', type: 'string', required: false, description: 'Target branch (default: main)' }
    ],
    responses: [
      { status: 200, description: 'Merge result' }
    ]
  },
  {
    name: 'Switch Branch',
    method: 'POST',
    path: '/functions/v1/switch-branch',
    description: 'Switch active branch',
    category: 'Versioning',
    auth: 'user',
    body: [
      { name: 'scriptId', type: 'string', required: true, description: 'Script ID' },
      { name: 'branchId', type: 'string', required: true, description: 'Branch to switch to' }
    ],
    responses: [
      { status: 200, description: 'Branch switched' }
    ]
  },
  {
    name: 'Create Script Version',
    method: 'POST',
    path: '/functions/v1/create-script-version',
    description: 'Create a new version of a script',
    category: 'Versioning',
    auth: 'user',
    body: [
      { name: 'scriptId', type: 'string', required: true, description: 'Script ID' },
      { name: 'content', type: 'string', required: true, description: 'New version content' },
      { name: 'changeDescription', type: 'string', required: false, description: 'Version notes' }
    ],
    responses: [
      { status: 200, description: 'Created version' }
    ]
  },

  // A/B Testing
  {
    name: 'Run A/B Test',
    method: 'POST',
    path: '/functions/v1/run-ab-test',
    description: 'Start an A/B test for script variants',
    category: 'Testing',
    auth: 'user',
    body: [
      { name: 'scriptId', type: 'string', required: true, description: 'Script to test' },
      { name: 'variants', type: 'array', required: true, description: 'Test variants' },
      { name: 'hypothesis', type: 'string', required: false, description: 'Test hypothesis' }
    ],
    responses: [
      { status: 200, description: 'Test started' }
    ]
  },
  {
    name: 'Complete A/B Test',
    method: 'POST',
    path: '/functions/v1/complete-ab-test',
    description: 'Complete an A/B test and record winner',
    category: 'Testing',
    auth: 'user',
    body: [
      { name: 'testId', type: 'string', required: true, description: 'Test ID' },
      { name: 'winnerVariantId', type: 'string', required: true, description: 'Winning variant ID' }
    ],
    responses: [
      { status: 200, description: 'Test completed' }
    ]
  },

  // Video Generation
  {
    name: 'Generate Video Project',
    method: 'POST',
    path: '/functions/v1/generate-video-project',
    description: 'Create a video project from script',
    category: 'Video',
    auth: 'user',
    body: [
      { name: 'scriptId', type: 'string', required: true, description: 'Source script ID' },
      { name: 'title', type: 'string', required: true, description: 'Video title' },
      { name: 'settings', type: 'object', required: false, description: 'Video settings' }
    ],
    responses: [
      { status: 200, description: 'Video project created' }
    ]
  },
  {
    name: 'Generate Scene Visuals',
    method: 'POST',
    path: '/functions/v1/generate-scene-visuals',
    description: 'Generate AI visuals for a scene',
    category: 'Video',
    auth: 'user',
    body: [
      { name: 'sceneId', type: 'string', required: true, description: 'Scene ID' },
      { name: 'prompt', type: 'string', required: true, description: 'Visual generation prompt' }
    ],
    responses: [
      { status: 200, description: 'Generated visual URL' }
    ]
  },
  {
    name: 'Generate Scene Audio',
    method: 'POST',
    path: '/functions/v1/generate-scene-audio',
    description: 'Generate TTS audio for a scene',
    category: 'Video',
    auth: 'user',
    body: [
      { name: 'sceneId', type: 'string', required: true, description: 'Scene ID' },
      { name: 'text', type: 'string', required: true, description: 'Text to synthesize' },
      { name: 'voice', type: 'string', required: false, description: 'Voice ID' }
    ],
    responses: [
      { status: 200, description: 'Generated audio URL' }
    ]
  },
  {
    name: 'TTS Preview',
    method: 'POST',
    path: '/functions/v1/tts-preview',
    description: 'Preview text-to-speech audio',
    category: 'Video',
    auth: 'user',
    body: [
      { name: 'text', type: 'string', required: true, description: 'Text to preview' },
      { name: 'voice', type: 'string', required: false, description: 'Voice ID' }
    ],
    responses: [
      { status: 200, description: 'Audio preview URL' }
    ]
  },
  {
    name: 'Get Video Projects',
    method: 'POST',
    path: '/functions/v1/get-video-projects',
    description: 'Retrieve user video projects',
    category: 'Video',
    auth: 'user',
    responses: [
      { status: 200, description: 'List of video projects' }
    ]
  },

  // Series
  {
    name: 'Generate Series',
    method: 'POST',
    path: '/functions/v1/generate-series',
    description: 'Generate a content series',
    category: 'Content',
    auth: 'user',
    body: [
      { name: 'premise', type: 'string', required: true, description: 'Series premise' },
      { name: 'episodeCount', type: 'number', required: true, description: 'Number of episodes' },
      { name: 'niche', type: 'string', required: true, description: 'Content niche' }
    ],
    responses: [
      { status: 200, description: 'Generated series' }
    ]
  },
  {
    name: 'Generate Series Suggestions',
    method: 'POST',
    path: '/functions/v1/generate-series-suggestions',
    description: 'Get AI suggestions for series ideas',
    category: 'Content',
    auth: 'user',
    body: [
      { name: 'niche', type: 'string', required: true, description: 'Content niche' }
    ],
    responses: [
      { status: 200, description: 'Series suggestions' }
    ]
  },

  // Trends
  {
    name: 'Fetch Trends',
    method: 'POST',
    path: '/functions/v1/fetch-trends',
    description: 'Fetch trending topics',
    category: 'Content',
    auth: 'user',
    body: [
      { name: 'platform', type: 'string', required: false, description: 'Platform filter' }
    ],
    responses: [
      { status: 200, description: 'Trending topics' }
    ]
  },
  {
    name: 'Generate Trend Insights',
    method: 'POST',
    path: '/functions/v1/generate-trend-insights',
    description: 'Get AI insights on trends',
    category: 'Content',
    auth: 'user',
    body: [
      { name: 'trendId', type: 'string', required: true, description: 'Trend ID' }
    ],
    responses: [
      { status: 200, description: 'Trend insights' }
    ]
  },

  // Admin
  {
    name: 'Admin Get Users',
    method: 'POST',
    path: '/functions/v1/admin-get-users',
    description: 'Get all users (admin only)',
    category: 'Admin',
    auth: 'admin',
    body: [
      { name: 'limit', type: 'number', required: false, description: 'Max users to return' },
      { name: 'offset', type: 'number', required: false, description: 'Pagination offset' }
    ],
    responses: [
      { status: 200, description: 'User list' },
      { status: 403, description: 'Admin access required' }
    ]
  },
  {
    name: 'Admin Get Content',
    method: 'POST',
    path: '/functions/v1/admin-get-content',
    description: 'Get all content (admin only)',
    category: 'Admin',
    auth: 'admin',
    body: [
      { name: 'type', type: 'string', required: false, description: 'Content type filter' }
    ],
    responses: [
      { status: 200, description: 'Content list' }
    ]
  },
  {
    name: 'Verify Admin Access',
    method: 'POST',
    path: '/functions/v1/verify-admin-access',
    description: 'Verify admin role',
    category: 'Admin',
    auth: 'user',
    responses: [
      { status: 200, description: 'Admin status' }
    ]
  },
  {
    name: 'Log Admin Action',
    method: 'POST',
    path: '/functions/v1/log-admin-action',
    description: 'Log an admin action for audit',
    category: 'Admin',
    auth: 'admin',
    body: [
      { name: 'action', type: 'string', required: true, description: 'Action performed' },
      { name: 'resourceType', type: 'string', required: true, description: 'Resource type' },
      { name: 'resourceId', type: 'string', required: true, description: 'Resource ID' },
      { name: 'reason', type: 'string', required: false, description: 'Action reason' }
    ],
    responses: [
      { status: 200, description: 'Action logged' }
    ]
  },
  {
    name: 'Rotate API Key',
    method: 'POST',
    path: '/functions/v1/rotate-api-key',
    description: 'Rotate an API key',
    category: 'Admin',
    auth: 'admin',
    body: [
      { name: 'keyType', type: 'string', required: true, description: 'Key type to rotate' }
    ],
    responses: [
      { status: 200, description: 'Key rotated' }
    ]
  },

  // Billing
  {
    name: 'Check Subscription',
    method: 'POST',
    path: '/functions/v1/check-subscription',
    description: 'Check user subscription status',
    category: 'Billing',
    auth: 'user',
    responses: [
      { status: 200, description: 'Subscription status' }
    ]
  },
  {
    name: 'Create Checkout',
    method: 'POST',
    path: '/functions/v1/create-checkout',
    description: 'Create Stripe checkout session',
    category: 'Billing',
    auth: 'user',
    body: [
      { name: 'priceId', type: 'string', required: true, description: 'Stripe price ID' }
    ],
    responses: [
      { status: 200, description: 'Checkout URL' }
    ]
  },
  {
    name: 'Customer Portal',
    method: 'POST',
    path: '/functions/v1/customer-portal',
    description: 'Get Stripe customer portal URL',
    category: 'Billing',
    auth: 'user',
    responses: [
      { status: 200, description: 'Portal URL' }
    ]
  },

  // Account
  {
    name: 'Delete Account',
    method: 'POST',
    path: '/functions/v1/delete-account',
    description: 'Delete user account and data',
    category: 'Account',
    auth: 'user',
    body: [
      { name: 'confirmation', type: 'string', required: true, description: 'Confirmation text' }
    ],
    responses: [
      { status: 200, description: 'Account deleted' }
    ]
  },

  // Email
  {
    name: 'Send Welcome Email',
    method: 'POST',
    path: '/functions/v1/send-welcome-email',
    description: 'Send welcome email to new user',
    category: 'Email',
    auth: 'service',
    body: [
      { name: 'userId', type: 'string', required: true, description: 'User ID' },
      { name: 'type', type: 'string', required: true, description: '"welcome" | "verification" | "notification"' }
    ],
    responses: [
      { status: 200, description: 'Email sent' }
    ]
  },
  {
    name: 'Send Registration Email',
    method: 'POST',
    path: '/functions/v1/send-registration-email',
    description: 'Send registration confirmation',
    category: 'Email',
    auth: 'service',
    body: [
      { name: 'email', type: 'string', required: true, description: 'User email' }
    ],
    responses: [
      { status: 200, description: 'Email sent' }
    ]
  },

  // Misc
  {
    name: 'AI Generate',
    method: 'POST',
    path: '/functions/v1/ai-generate',
    description: 'Generic AI generation endpoint',
    category: 'AI',
    auth: 'user',
    body: [
      { name: 'prompt', type: 'string', required: true, description: 'AI prompt' },
      { name: 'type', type: 'string', required: true, description: 'Generation type' }
    ],
    responses: [
      { status: 200, description: 'Generated content' }
    ]
  },
  {
    name: 'Demo Viral Score',
    method: 'POST',
    path: '/functions/v1/demo-viral-score',
    description: 'Demo viral score calculation',
    category: 'Content',
    auth: 'public',
    body: [
      { name: 'content', type: 'string', required: true, description: 'Content to analyze' }
    ],
    responses: [
      { status: 200, description: 'Viral score' }
    ]
  },
  {
    name: 'Security Headers',
    method: 'GET',
    path: '/functions/v1/security-headers',
    description: 'Get security headers configuration',
    category: 'Security',
    auth: 'admin',
    responses: [
      { status: 200, description: 'Security headers list' }
    ]
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: FileCode },
  { id: 'Security', label: 'Security', icon: Shield },
  { id: 'Content', label: 'Content', icon: FileText },
  { id: 'Video', label: 'Video', icon: Video },
  { id: 'Versioning', label: 'Versioning', icon: Database },
  { id: 'Testing', label: 'Testing', icon: Activity },
  { id: 'Admin', label: 'Admin', icon: Users },
  { id: 'Billing', label: 'Billing', icon: Key },
  { id: 'Email', label: 'Email', icon: Bell },
  { id: 'AI', label: 'AI', icon: Zap }
];

export const ApiDocsPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('docs');

  const filteredEndpoints = API_ENDPOINTS.filter(ep => {
    const matchesSearch = search === '' || 
      ep.name.toLowerCase().includes(search.toLowerCase()) ||
      ep.path.toLowerCase().includes(search.toLowerCase()) ||
      ep.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = category === 'all' || ep.category === category;
    
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'POST': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'PUT': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'DELETE': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getAuthBadge = (auth: string) => {
    switch (auth) {
      case 'public': return <Badge variant="secondary" className="text-xs"><Unlock className="h-3 w-3 mr-1" />Public</Badge>;
      case 'user': return <Badge variant="outline" className="text-xs"><Lock className="h-3 w-3 mr-1" />User</Badge>;
      case 'admin': return <Badge variant="destructive" className="text-xs"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'service': return <Badge className="text-xs bg-purple-500/20 text-purple-500 border-purple-500/30"><Key className="h-3 w-3 mr-1" />Service</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
          <p className="text-muted-foreground">Complete reference for all Edge Functions</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="docs">
              <FileCode className="h-4 w-4 mr-2" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="sandbox">
              <FlaskConical className="h-4 w-4 mr-2" />
              Testing Sandbox
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 'sandbox' ? (
        <ApiTestingSandbox />
      ) : (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search endpoints..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="text-sm text-muted-foreground self-center">
              {filteredEndpoints.length} endpoints
            </div>
          </div>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
          {CATEGORIES.map(cat => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <cat.icon className="h-4 w-4 mr-1" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Endpoints List */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4">
          {filteredEndpoints.map((endpoint) => (
            <Collapsible key={endpoint.path + endpoint.method}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={cn("font-mono text-xs w-16 justify-center", getMethodColor(endpoint.method))}
                        >
                          {endpoint.method}
                        </Badge>
                        <div>
                          <CardTitle className="text-base">{endpoint.name}</CardTitle>
                          <code className="text-xs text-muted-foreground font-mono">{endpoint.path}</code>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getAuthBadge(endpoint.auth)}
                        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </div>
                    </div>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0 space-y-4">
                    {/* Request Body */}
                    {endpoint.body && endpoint.body.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Request Body</h4>
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          {endpoint.body.map((param) => (
                            <div key={param.name} className="flex items-start gap-2 text-sm">
                              <code className="font-mono text-primary">{param.name}</code>
                              <span className="text-muted-foreground">:</span>
                              <span className="text-muted-foreground">{param.type}</span>
                              {param.required && <Badge variant="outline" className="text-xs">required</Badge>}
                              <span className="text-muted-foreground">— {param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Responses */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Responses</h4>
                      <div className="space-y-2">
                        {endpoint.responses.map((res) => (
                          <div key={res.status} className="flex items-center gap-2 text-sm">
                            <Badge 
                              variant={res.status < 400 ? 'secondary' : 'destructive'}
                              className="font-mono"
                            >
                              {res.status}
                            </Badge>
                            <span className="text-muted-foreground">{res.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Example */}
                    {endpoint.example && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Example</h4>
                        <div className="relative">
                          <pre className="bg-muted/50 rounded-lg p-3 text-xs overflow-x-auto font-mono">
                            {JSON.stringify(endpoint.example, null, 2)}
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(JSON.stringify(endpoint.example, null, 2), endpoint.path)}
                          >
                            {copiedId === endpoint.path ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Copy cURL */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const curl = `curl -X ${endpoint.method} \\
  "${window.location.origin}${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"${endpoint.example?.request ? ` \\
  -d '${JSON.stringify(endpoint.example.request)}'` : ''}`;
                          copyToClipboard(curl, `curl-${endpoint.path}`);
                        }}
                      >
                        {copiedId === `curl-${endpoint.path}` ? (
                          <Check className="h-4 w-4 mr-2" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2" />
                        )}
                        Copy cURL
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
        </>
      )}
    </div>
  );
};
