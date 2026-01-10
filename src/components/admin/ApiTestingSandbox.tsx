import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Copy, 
  Trash2,
  Save,
  History,
  Code,
  AlertCircle,
  Info,
  ChevronDown,
  FileJson
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestResult {
  id: string;
  endpoint: string;
  method: string;
  status: number;
  statusText: string;
  duration: number;
  timestamp: Date;
  request: {
    body?: string;
    headers?: Record<string, string>;
  };
  response: any;
  error?: string;
  validationErrors?: string[];
}

interface SavedRequest {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  body: string;
}

interface EndpointSchema {
  path: string;
  label: string;
  auth: 'public' | 'user' | 'admin' | 'service';
  description: string;
  requestSchema: {
    properties: Record<string, {
      type: string;
      required?: boolean;
      description: string;
      enum?: string[];
      example?: any;
    }>;
  };
  responseSchema: {
    success: Record<string, { type: string; description: string }>;
    error?: Record<string, { type: string; description: string }>;
  };
}

const ENDPOINT_SCHEMAS: EndpointSchema[] = [
  {
    path: 'login-rate-limit',
    label: 'Login Rate Limit',
    auth: 'public',
    description: 'Check and enforce login rate limits with CAPTCHA support',
    requestSchema: {
      properties: {
        action: {
          type: 'string',
          required: true,
          description: 'The action to perform',
          enum: ['check', 'record_attempt', 'reset'],
          example: 'check',
        },
        success: {
          type: 'boolean',
          description: 'Whether the login attempt was successful (for record_attempt)',
          example: true,
        },
        captchaSolved: {
          type: 'boolean',
          description: 'Whether CAPTCHA was solved',
          example: false,
        },
      },
    },
    responseSchema: {
      success: {
        allowed: { type: 'boolean', description: 'Whether the action is allowed' },
        blocked: { type: 'boolean', description: 'Whether the IP is blocked' },
        remainingAttempts: { type: 'number', description: 'Remaining login attempts' },
        requiresCaptcha: { type: 'boolean', description: 'Whether CAPTCHA is required' },
      },
      error: {
        blocked: { type: 'boolean', description: 'IP is blocked' },
        retryAfterSeconds: { type: 'number', description: 'Seconds until retry allowed' },
      },
    },
  },
  {
    path: 'demo-viral-score',
    label: 'Demo Viral Score',
    auth: 'public',
    description: 'Calculate viral score for demo content',
    requestSchema: {
      properties: {
        content: {
          type: 'string',
          required: true,
          description: 'The content to analyze',
          example: 'This is my viral script about...',
        },
      },
    },
    responseSchema: {
      success: {
        viralScore: { type: 'number', description: 'Viral score from 0-100' },
        hookStrength: { type: 'number', description: 'Hook strength score' },
        emotionalImpact: { type: 'number', description: 'Emotional impact score' },
      },
    },
  },
  {
    path: 'analyze-script',
    label: 'Analyze Script',
    auth: 'user',
    description: 'Analyze script for viral potential',
    requestSchema: {
      properties: {
        content: {
          type: 'string',
          required: true,
          description: 'Script content to analyze',
          example: 'POV: You just discovered...',
        },
        niche: {
          type: 'string',
          description: 'Content niche for context',
          example: 'comedy',
        },
      },
    },
    responseSchema: {
      success: {
        viralScore: { type: 'number', description: 'Overall viral potential' },
        metrics: { type: 'object', description: 'Detailed scoring metrics' },
        recommendations: { type: 'array', description: 'Improvement suggestions' },
      },
    },
  },
  {
    path: 'get-security-events',
    label: 'Get Security Events',
    auth: 'admin',
    description: 'Retrieve security events for monitoring',
    requestSchema: {
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum events to return',
          example: 50,
        },
      },
    },
    responseSchema: {
      success: {
        events: { type: 'array', description: 'List of security events' },
        total: { type: 'number', description: 'Total event count' },
      },
    },
  },
  {
    path: 'send-security-digest',
    label: 'Send Security Digest',
    auth: 'admin',
    description: 'Send security digest email to admins',
    requestSchema: {
      properties: {
        digestType: {
          type: 'string',
          required: true,
          description: 'Type of digest to send',
          enum: ['daily', 'weekly'],
          example: 'daily',
        },
        adminEmails: {
          type: 'array',
          description: 'Optional list of additional email recipients',
          example: ['admin@example.com'],
        },
      },
    },
    responseSchema: {
      success: {
        success: { type: 'boolean', description: 'Whether digest was sent' },
        emailsSent: { type: 'number', description: 'Number of emails sent' },
        summary: { type: 'object', description: 'Security summary data' },
      },
    },
  },
  {
    path: 'check-subscription',
    label: 'Check Subscription',
    auth: 'user',
    description: 'Check user subscription status',
    requestSchema: {
      properties: {},
    },
    responseSchema: {
      success: {
        subscribed: { type: 'boolean', description: 'Whether user is subscribed' },
        tier: { type: 'string', description: 'Subscription tier' },
        expiresAt: { type: 'string', description: 'Subscription expiry date' },
      },
    },
  },
  {
    path: 'fetch-trends',
    label: 'Fetch Trends',
    auth: 'user',
    description: 'Fetch trending topics',
    requestSchema: {
      properties: {
        platform: {
          type: 'string',
          description: 'Platform to filter by',
          example: 'tiktok',
        },
      },
    },
    responseSchema: {
      success: {
        trends: { type: 'array', description: 'List of trending topics' },
      },
    },
  },
  {
    path: 'admin-get-users',
    label: 'Admin Get Users',
    auth: 'admin',
    description: 'Get all users (admin only)',
    requestSchema: {
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum users to return',
          example: 50,
        },
        offset: {
          type: 'number',
          description: 'Pagination offset',
          example: 0,
        },
      },
    },
    responseSchema: {
      success: {
        users: { type: 'array', description: 'List of users' },
        total: { type: 'number', description: 'Total user count' },
      },
    },
  },
  {
    path: 'security-headers',
    label: 'Security Headers',
    auth: 'admin',
    description: 'Get security headers configuration',
    requestSchema: {
      properties: {},
    },
    responseSchema: {
      success: {
        headers: { type: 'array', description: 'List of security headers' },
      },
    },
  },
  {
    path: 'get-user-scripts',
    label: 'Get User Scripts',
    auth: 'user',
    description: 'Get user scripts',
    requestSchema: {
      properties: {},
    },
    responseSchema: {
      success: {
        scripts: { type: 'array', description: 'List of user scripts' },
      },
    },
  },
];

export const ApiTestingSandbox = () => {
  const [endpoint, setEndpoint] = useState('login-rate-limit');
  const [method, setMethod] = useState('POST');
  const [body, setBody] = useState('{\n  "action": "check"\n}');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>(() => {
    const saved = localStorage.getItem('api_sandbox_saved');
    return saved ? JSON.parse(saved) : [];
  });
  const [saveName, setSaveName] = useState('');
  const [showSchema, setShowSchema] = useState(true);

  const selectedSchema = useMemo(() => 
    ENDPOINT_SCHEMAS.find(e => e.path === endpoint),
    [endpoint]
  );

  const validateRequest = (bodyStr: string): string[] => {
    const errors: string[] = [];
    
    if (!selectedSchema) return errors;

    try {
      const parsed = bodyStr.trim() ? JSON.parse(bodyStr) : {};
      
      // Check required fields
      Object.entries(selectedSchema.requestSchema.properties).forEach(([key, prop]) => {
        if (prop.required && (parsed[key] === undefined || parsed[key] === null || parsed[key] === '')) {
          errors.push(`Missing required field: ${key}`);
        }
      });

      // Check enum values
      Object.entries(selectedSchema.requestSchema.properties).forEach(([key, prop]) => {
        if (prop.enum && parsed[key] !== undefined && !prop.enum.includes(parsed[key])) {
          errors.push(`Invalid value for ${key}. Must be one of: ${prop.enum.join(', ')}`);
        }
      });

      // Type checking
      Object.entries(selectedSchema.requestSchema.properties).forEach(([key, prop]) => {
        if (parsed[key] !== undefined) {
          const actualType = Array.isArray(parsed[key]) ? 'array' : typeof parsed[key];
          if (prop.type !== actualType && !(prop.type === 'array' && actualType === 'object')) {
            errors.push(`Invalid type for ${key}. Expected ${prop.type}, got ${actualType}`);
          }
        }
      });
    } catch (e) {
      errors.push('Invalid JSON format');
    }

    return errors;
  };

  const generateExampleBody = () => {
    if (!selectedSchema) return;
    
    const example: Record<string, any> = {};
    Object.entries(selectedSchema.requestSchema.properties).forEach(([key, prop]) => {
      if (prop.example !== undefined) {
        example[key] = prop.example;
      } else if (prop.enum) {
        example[key] = prop.enum[0];
      } else if (prop.required) {
        switch (prop.type) {
          case 'string': example[key] = ''; break;
          case 'number': example[key] = 0; break;
          case 'boolean': example[key] = false; break;
          case 'array': example[key] = []; break;
          case 'object': example[key] = {}; break;
        }
      }
    });
    
    setBody(JSON.stringify(example, null, 2));
    toast.success('Generated example request body');
  };

  const executeRequest = async () => {
    setLoading(true);
    const startTime = performance.now();
    const validationErrors = validateRequest(body);

    try {
      let parsedBody = {};
      try {
        parsedBody = body.trim() ? JSON.parse(body) : {};
      } catch (e) {
        toast.error('Invalid JSON in request body');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: parsedBody
      });

      const duration = Math.round(performance.now() - startTime);

      const result: TestResult = {
        id: crypto.randomUUID(),
        endpoint,
        method,
        status: error ? 500 : 200,
        statusText: error ? 'Error' : 'OK',
        duration,
        timestamp: new Date(),
        request: { body },
        response: error || data,
        error: error?.message,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      };

      setResults(prev => [result, ...prev.slice(0, 19)]);

      if (error) {
        toast.error('Request failed', { description: error.message });
      } else {
        toast.success('Request successful', { description: `${duration}ms` });
      }
    } catch (error: any) {
      const duration = Math.round(performance.now() - startTime);
      
      const result: TestResult = {
        id: crypto.randomUUID(),
        endpoint,
        method,
        status: 500,
        statusText: 'Error',
        duration,
        timestamp: new Date(),
        request: { body },
        response: null,
        error: error.message,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
      };

      setResults(prev => [result, ...prev.slice(0, 19)]);
      toast.error('Request failed', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const saveRequest = () => {
    if (!saveName.trim()) {
      toast.error('Please enter a name for the saved request');
      return;
    }

    const newRequest: SavedRequest = {
      id: crypto.randomUUID(),
      name: saveName,
      endpoint,
      method,
      body
    };

    const updated = [...savedRequests, newRequest];
    setSavedRequests(updated);
    localStorage.setItem('api_sandbox_saved', JSON.stringify(updated));
    setSaveName('');
    toast.success('Request saved');
  };

  const loadRequest = (request: SavedRequest) => {
    setEndpoint(request.endpoint);
    setMethod(request.method);
    setBody(request.body);
    toast.success(`Loaded: ${request.name}`);
  };

  const deleteRequest = (id: string) => {
    const updated = savedRequests.filter(r => r.id !== id);
    setSavedRequests(updated);
    localStorage.setItem('api_sandbox_saved', JSON.stringify(updated));
    toast.success('Request deleted');
  };

  const clearHistory = () => {
    setResults([]);
    toast.success('History cleared');
  };

  const copyResponse = (response: any) => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    toast.success('Copied to clipboard');
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 400 && status < 500) return 'text-yellow-500';
    return 'text-red-500';
  };

  const currentValidationErrors = useMemo(() => validateRequest(body), [body, endpoint]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          API Testing Sandbox
        </CardTitle>
        <CardDescription>
          Test edge functions with request validation and schema documentation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="request" className="space-y-4">
          <TabsList>
            <TabsTrigger value="request">Request</TabsTrigger>
            <TabsTrigger value="schema">
              <FileJson className="h-4 w-4 mr-1" />
              Schema
            </TabsTrigger>
            <TabsTrigger value="saved">
              Saved ({savedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({results.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-4">
            {/* Endpoint Selection */}
            <div className="flex gap-2">
              <div className="w-24">
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={endpoint} onValueChange={setEndpoint}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENDPOINT_SCHEMAS.map(ep => (
                      <SelectItem key={ep.path} value={ep.path}>
                        <div className="flex items-center gap-2">
                          <span>{ep.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {ep.auth}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Endpoint Description */}
            {selectedSchema && (
              <div className="text-sm text-muted-foreground flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <p>{selectedSchema.description}</p>
                  <Badge variant={
                    selectedSchema.auth === 'public' ? 'secondary' :
                    selectedSchema.auth === 'admin' ? 'destructive' : 'default'
                  } className="mt-1">
                    {selectedSchema.auth === 'public' ? 'Public' :
                     selectedSchema.auth === 'admin' ? 'Admin Required' : 'User Required'}
                  </Badge>
                </div>
              </div>
            )}

            {/* Request Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Request Body (JSON)</Label>
                <Button variant="ghost" size="sm" onClick={generateExampleBody}>
                  <FileJson className="h-4 w-4 mr-1" />
                  Generate Example
                </Button>
              </div>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                className={cn(
                  "font-mono text-sm min-h-[150px]",
                  currentValidationErrors.length > 0 && "border-yellow-500"
                )}
              />
            </div>

            {/* Validation Errors */}
            {currentValidationErrors.length > 0 && (
              <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3 space-y-1">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 font-medium text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Validation Warnings
                </div>
                <ul className="text-sm text-yellow-600 dark:text-yellow-400 space-y-1 ml-6 list-disc">
                  {currentValidationErrors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Execute Button */}
            <div className="flex gap-2">
              <Button
                onClick={executeRequest}
                disabled={loading}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                {loading ? 'Executing...' : 'Execute Request'}
              </Button>
            </div>

            {/* Save Request */}
            <div className="flex gap-2">
              <Input
                placeholder="Save as..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={saveRequest}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>

            {/* Latest Result */}
            {results[0] && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Response</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge 
                      variant={results[0].status < 400 ? 'default' : 'destructive'}
                      className={cn("font-mono", getStatusColor(results[0].status))}
                    >
                      {results[0].status} {results[0].statusText}
                    </Badge>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {results[0].duration}ms
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyResponse(results[0].response)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-[200px] rounded-md border bg-muted/30 p-4">
                  <pre className="text-xs font-mono whitespace-pre-wrap">
                    {JSON.stringify(results[0].response, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            )}
          </TabsContent>

          {/* Schema Tab */}
          <TabsContent value="schema" className="space-y-4">
            {selectedSchema ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      Request Schema: {selectedSchema.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(selectedSchema.requestSchema.properties).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No request body required</p>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(selectedSchema.requestSchema.properties).map(([key, prop]) => (
                          <div key={key} className="rounded-lg border p-3 space-y-1">
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-sm text-primary">{key}</code>
                              <Badge variant="outline" className="text-xs">{prop.type}</Badge>
                              {prop.required && <Badge variant="destructive" className="text-xs">required</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{prop.description}</p>
                            {prop.enum && (
                              <div className="flex gap-1 flex-wrap mt-1">
                                <span className="text-xs text-muted-foreground">Values:</span>
                                {prop.enum.map(v => (
                                  <Badge key={v} variant="secondary" className="text-xs font-mono">{v}</Badge>
                                ))}
                              </div>
                            )}
                            {prop.example !== undefined && (
                              <p className="text-xs text-muted-foreground">
                                Example: <code className="font-mono">{JSON.stringify(prop.example)}</code>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Response Schema (Success)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(selectedSchema.responseSchema.success).map(([key, prop]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <code className="font-mono text-primary">{key}</code>
                          <Badge variant="outline" className="text-xs">{prop.type}</Badge>
                          <span className="text-muted-foreground">— {prop.description}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {selectedSchema.responseSchema.error && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        Response Schema (Error)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(selectedSchema.responseSchema.error).map(([key, prop]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <code className="font-mono text-primary">{key}</code>
                            <Badge variant="outline" className="text-xs">{prop.type}</Badge>
                            <span className="text-muted-foreground">— {prop.description}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileJson className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>Select an endpoint to view its schema</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-2">
            {savedRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Save className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No saved requests yet</p>
                <p className="text-sm">Save requests for quick access later</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedRequests.map(request => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{request.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.method} · {request.endpoint}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadRequest(request)}
                      >
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRequest(request.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-2">
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No request history</p>
                <p className="text-sm">Execute requests to see them here</p>
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearHistory}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear History
                  </Button>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {results.map(result => (
                      <Collapsible key={result.id}>
                        <div className="p-3 rounded-lg border bg-card space-y-2">
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {result.status < 400 ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="font-medium">{result.endpoint}</span>
                                <Badge variant="outline" className="font-mono text-xs">
                                  {result.method}
                                </Badge>
                                {result.validationErrors && (
                                  <Badge variant="secondary" className="text-xs">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Warnings
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge className={cn("font-mono", getStatusColor(result.status))}>
                                  {result.status}
                                </Badge>
                                <span>{result.duration}ms</span>
                                <span>{result.timestamp.toLocaleTimeString()}</span>
                                <ChevronDown className="h-4 w-4" />
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            {result.error && (
                              <p className="text-sm text-destructive mt-2">{result.error}</p>
                            )}
                            {result.validationErrors && (
                              <div className="mt-2 p-2 rounded bg-yellow-500/10 text-sm">
                                <p className="font-medium text-yellow-600">Validation Warnings:</p>
                                <ul className="list-disc ml-4 text-yellow-600">
                                  {result.validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                                </ul>
                              </div>
                            )}
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Response:</p>
                              <pre className="text-xs font-mono bg-muted/30 p-2 rounded overflow-x-auto">
                                {JSON.stringify(result.response, null, 2)}
                              </pre>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
