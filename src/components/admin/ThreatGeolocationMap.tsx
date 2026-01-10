import { useState, useEffect, memo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Globe, RefreshCw, AlertTriangle, MapPin, Filter, ZoomIn, ZoomOut } from 'lucide-react';

// World map GeoJSON URL
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface ThreatMarker {
  id: string;
  coordinates: [number, number];
  ip: string;
  city?: string;
  country: string;
  countryCode: string;
  threatLevel: 'critical' | 'high' | 'medium' | 'low';
  attempts: number;
  lastSeen: string;
  type: 'failed_auth' | 'rate_limit' | 'suspicious_activity' | 'api_abuse';
}

interface CountryStats {
  country: string;
  countryCode: string;
  totalThreats: number;
  criticalCount: number;
}

// Mock geolocation data for demo purposes
const MOCK_THREATS: ThreatMarker[] = [
  {
    id: '1',
    coordinates: [-74.006, 40.7128],
    ip: '192.168.1.100',
    city: 'New York',
    country: 'United States',
    countryCode: 'US',
    threatLevel: 'high',
    attempts: 45,
    lastSeen: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    type: 'failed_auth'
  },
  {
    id: '2',
    coordinates: [-0.1276, 51.5074],
    ip: '10.0.0.50',
    city: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    threatLevel: 'medium',
    attempts: 23,
    lastSeen: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    type: 'rate_limit'
  },
  {
    id: '3',
    coordinates: [139.6917, 35.6895],
    ip: '172.16.0.1',
    city: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    threatLevel: 'low',
    attempts: 8,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: 'suspicious_activity'
  },
  {
    id: '4',
    coordinates: [37.6173, 55.7558],
    ip: '203.0.113.50',
    city: 'Moscow',
    country: 'Russia',
    countryCode: 'RU',
    threatLevel: 'critical',
    attempts: 156,
    lastSeen: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    type: 'api_abuse'
  },
  {
    id: '5',
    coordinates: [116.4074, 39.9042],
    ip: '198.51.100.25',
    city: 'Beijing',
    country: 'China',
    countryCode: 'CN',
    threatLevel: 'high',
    attempts: 89,
    lastSeen: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    type: 'failed_auth'
  },
  {
    id: '6',
    coordinates: [-46.6333, -23.5505],
    ip: '192.0.2.100',
    city: 'São Paulo',
    country: 'Brazil',
    countryCode: 'BR',
    threatLevel: 'medium',
    attempts: 34,
    lastSeen: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    type: 'rate_limit'
  }
];

const getThreatColor = (level: string) => {
  switch (level) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#eab308';
    case 'low': return '#22c55e';
    default: return '#6b7280';
  }
};

const getMarkerSize = (attempts: number) => {
  if (attempts > 100) return 12;
  if (attempts > 50) return 10;
  if (attempts > 20) return 8;
  return 6;
};

export const ThreatGeolocationMap = () => {
  const [threats, setThreats] = useState<ThreatMarker[]>(MOCK_THREATS);
  const [selectedThreat, setSelectedThreat] = useState<ThreatMarker | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  const countryStats: CountryStats[] = threats.reduce((acc, threat) => {
    const existing = acc.find(c => c.countryCode === threat.countryCode);
    if (existing) {
      existing.totalThreats += threat.attempts;
      if (threat.threatLevel === 'critical') existing.criticalCount++;
    } else {
      acc.push({
        country: threat.country,
        countryCode: threat.countryCode,
        totalThreats: threat.attempts,
        criticalCount: threat.threatLevel === 'critical' ? 1 : 0
      });
    }
    return acc;
  }, [] as CountryStats[]);

  const filteredThreats = filterLevel === 'all' 
    ? threats 
    : threats.filter(t => t.threatLevel === filterLevel);

  const refreshData = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from the edge function
      // For now, we simulate a refresh with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Randomize some values to simulate new data
      const updated = MOCK_THREATS.map(t => ({
        ...t,
        attempts: t.attempts + Math.floor(Math.random() * 10),
        lastSeen: new Date().toISOString()
      }));
      setThreats(updated);
      toast.success('Threat data refreshed');
    } catch (error) {
      toast.error('Failed to refresh threat data');
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => setZoom(Math.min(zoom * 1.5, 8));
  const handleZoomOut = () => setZoom(Math.max(zoom / 1.5, 1));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Global Threat Map
            </CardTitle>
            <CardDescription>
              Real-time visualization of security threats by geographic location
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Container */}
        <div className="relative bg-muted/30 rounded-lg overflow-hidden border" style={{ height: '400px' }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 120 * zoom,
              center: center
            }}
            style={{ width: '100%', height: '100%' }}
          >
            <ZoomableGroup zoom={zoom} center={center} onMoveEnd={({ coordinates }) => setCenter(coordinates as [number, number])}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryData = countryStats.find(
                      c => c.countryCode === geo.properties.ISO_A2
                    );
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={countryData ? 
                          countryData.criticalCount > 0 ? '#7f1d1d' : '#374151' 
                          : '#1f2937'
                        }
                        stroke="#4b5563"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: { fill: '#4b5563', outline: 'none' },
                          pressed: { outline: 'none' }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
              
              {/* Threat Markers */}
              {filteredThreats.map((threat) => (
                <Marker
                  key={threat.id}
                  coordinates={threat.coordinates}
                  onClick={() => setSelectedThreat(threat)}
                >
                  <circle
                    r={getMarkerSize(threat.attempts)}
                    fill={getThreatColor(threat.threatLevel)}
                    fillOpacity={0.8}
                    stroke="#fff"
                    strokeWidth={1}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Pulse animation for critical threats */}
                  {threat.threatLevel === 'critical' && (
                    <circle
                      r={getMarkerSize(threat.attempts) * 2}
                      fill="none"
                      stroke={getThreatColor(threat.threatLevel)}
                      strokeWidth={2}
                      opacity={0.5}
                    >
                      <animate
                        attributeName="r"
                        from={getMarkerSize(threat.attempts)}
                        to={getMarkerSize(threat.attempts) * 2.5}
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.6"
                        to="0"
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border shadow-lg">
            <p className="text-xs font-medium mb-2">Threat Level</p>
            <div className="flex flex-col gap-1">
              {[
                { level: 'critical', label: 'Critical' },
                { level: 'high', label: 'High' },
                { level: 'medium', label: 'Medium' },
                { level: 'low', label: 'Low' }
              ].map(({ level, label }) => (
                <div key={level} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getThreatColor(level) }}
                  />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Threat Details */}
        {selectedThreat && (
          <div className="bg-muted/30 rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-full"
                  style={{ backgroundColor: `${getThreatColor(selectedThreat.threatLevel)}20` }}
                >
                  <AlertTriangle 
                    className="h-5 w-5" 
                    style={{ color: getThreatColor(selectedThreat.threatLevel) }}
                  />
                </div>
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedThreat.city}, {selectedThreat.country}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    IP: <code className="bg-muted px-1 rounded">{selectedThreat.ip}</code>
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                style={{ 
                  borderColor: getThreatColor(selectedThreat.threatLevel),
                  color: getThreatColor(selectedThreat.threatLevel)
                }}
              >
                {selectedThreat.threatLevel.toUpperCase()}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{selectedThreat.attempts}</p>
                <p className="text-xs text-muted-foreground">Total Attempts</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium capitalize">{selectedThreat.type.replace(/_/g, ' ')}</p>
                <p className="text-xs text-muted-foreground">Threat Type</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  {new Date(selectedThreat.lastSeen).toLocaleTimeString()}
                </p>
                <p className="text-xs text-muted-foreground">Last Seen</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              onClick={() => setSelectedThreat(null)}
            >
              Close Details
            </Button>
          </div>
        )}

        {/* Country Statistics */}
        <div className="grid gap-2 md:grid-cols-3">
          {countryStats
            .sort((a, b) => b.totalThreats - a.totalThreats)
            .slice(0, 6)
            .map((country) => (
              <div 
                key={country.countryCode}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCountryFlag(country.countryCode)}</span>
                  <span className="text-sm font-medium">{country.country}</span>
                </div>
                <Badge variant={country.criticalCount > 0 ? 'destructive' : 'secondary'}>
                  {country.totalThreats} threats
                </Badge>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get country flag emoji
function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
