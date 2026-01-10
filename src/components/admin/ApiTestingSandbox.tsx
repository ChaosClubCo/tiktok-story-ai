import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Code
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
}

interface SavedRequest {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  body: string;
}

const ENDPOINTS = [
  { path: 'login-rate-limit', label: 'Login Rate Limit', auth: 'public' },
  { path: 'demo-viral-score', label: 'Demo Viral Score', auth: 'public' },
  { path: 'check-subscription', label: 'Check Subscription', auth: 'user' },
  { path: 'get-user-scripts', label: 'Get User Scripts', auth: 'user' },
  { path: 'fetch-trends', label: 'Fetch Trends', auth: 'user' },
  { path: 'analyze-script', label: 'Analyze Script', auth: 'user' },
  { path: 'security-headers', label: 'Security Headers', auth: 'admin' },
  { path: 'get-security-events', label: 'Get Security Events', auth: 'admin' },
  { path: 'admin-get-users', label: 'Admin Get Users', auth: 'admin' },
  { path: 'send-security-digest', label: 'Send Security Digest', auth: 'admin' },
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

  const executeRequest = async () => {
    setLoading(true);
    const startTime = performance.now();

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
        error: error?.message
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
        error: error.message
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

  const selectedEndpoint = ENDPOINTS.find(e => e.path === endpoint);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          API Testing Sandbox
        </CardTitle>
        <CardDescription>
          Test edge functions directly from the admin panel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="request" className="space-y-4">
          <TabsList>
            <TabsTrigger value="request">Request</TabsTrigger>
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
                    {ENDPOINTS.map(ep => (
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

            {/* Auth Info */}
            {selectedEndpoint && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>Authentication:</span>
                <Badge variant={
                  selectedEndpoint.auth === 'public' ? 'secondary' :
                  selectedEndpoint.auth === 'admin' ? 'destructive' : 'default'
                }>
                  {selectedEndpoint.auth === 'public' ? 'Public' :
                   selectedEndpoint.auth === 'admin' ? 'Admin Required' : 'User Required'}
                </Badge>
                {selectedEndpoint.auth !== 'public' && (
                  <span className="text-xs">(Using your current session)</span>
                )}
              </div>
            )}

            {/* Request Body */}
            <div className="space-y-2">
              <Label>Request Body (JSON)</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder='{"key": "value"}'
                className="font-mono text-sm min-h-[150px]"
              />
            </div>

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
                      <div
                        key={result.id}
                        className="p-3 rounded-lg border bg-card space-y-2"
                      >
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
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge className={cn("font-mono", getStatusColor(result.status))}>
                              {result.status}
                            </Badge>
                            <span>{result.duration}ms</span>
                            <span>{result.timestamp.toLocaleTimeString()}</span>
                          </div>
                        </div>
                        {result.error && (
                          <p className="text-sm text-destructive">{result.error}</p>
                        )}
                        <details>
                          <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                            View Response
                          </summary>
                          <pre className="mt-2 text-xs font-mono bg-muted/30 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.response, null, 2)}
                          </pre>
                        </details>
                      </div>
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
