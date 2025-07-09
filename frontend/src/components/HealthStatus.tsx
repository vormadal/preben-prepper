'use client';

import { useHealthCheck } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Server } from 'lucide-react';

export function HealthStatus() {
  const { data: health, isLoading, error } = useHealthCheck();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Offline</Badge>
            <span className="text-sm text-muted-foreground">
              Unable to connect to API
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5" />
          API Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-500 text-white">
            {health?.status === 'ok' ? 'Online' : 'Unknown'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            API is responding normally
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Uptime</p>
              <p className="text-muted-foreground truncate">
                {health?.uptime ? formatUptime(health.uptime) : 'Unknown'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Last Check</p>
              <p className="text-muted-foreground truncate">
                {health?.timestamp 
                  ? new Date(health.timestamp).toLocaleTimeString()
                  : 'Unknown'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
