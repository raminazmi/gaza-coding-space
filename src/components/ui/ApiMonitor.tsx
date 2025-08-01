import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import apiMonitor from '@/utils/apiMonitor';
import { authService } from '@/services/authService';

interface ApiMonitorProps {
    isVisible?: boolean;
}

const ApiMonitor: React.FC<ApiMonitorProps> = ({ isVisible = false }) => {
    const [stats, setStats] = useState<any>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!isVisible) return;

        const updateStats = () => {
            const currentStats = apiMonitor.getRequestStats();
            setStats(currentStats);
        };

        updateStats();
        const interval = setInterval(updateStats, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [isVisible]);

    const clearLogs = () => {
        apiMonitor.clearLogs();
        setStats(apiMonitor.getRequestStats());
    };

    const clearCache = () => {
        authService.clearApiCache();
    };

    const getStatusColor = (requestsPerMinute: number) => {
        if (requestsPerMinute > 50) return 'bg-red-500';
        if (requestsPerMinute > 20) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getResponseTimeColor = (avgTime: number) => {
        if (avgTime > 2000) return 'text-red-500';
        if (avgTime > 1000) return 'text-yellow-500';
        return 'text-green-500';
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Card className="w-80 shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                        <span>API Monitor</span>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setIsExpanded(!isExpanded)}
                            >
                                {isExpanded ? 'Collapse' : 'Expand'}
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={clearLogs}
                            >
                                Clear
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    {stats && (
                        <>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <div className="font-medium">Total Requests</div>
                                    <div className="text-lg font-bold">{stats.totalRequests}</div>
                                </div>
                                <div>
                                    <div className="font-medium">Success Rate</div>
                                    <div className="text-lg font-bold">
                                        {stats.totalRequests > 0
                                            ? Math.round((stats.successfulRequests / stats.totalRequests) * 100)
                                            : 0}%
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Requests/Min</span>
                                    <span className={getStatusColor(stats.requestsPerMinute)}>
                                        {stats.requestsPerMinute.toFixed(1)}
                                    </span>
                                </div>
                                <Progress
                                    value={Math.min((stats.requestsPerMinute / 50) * 100, 100)}
                                    className="h-2"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>Avg Response Time</span>
                                    <span className={getResponseTimeColor(stats.averageResponseTime)}>
                                        {stats.averageResponseTime.toFixed(0)}ms
                                    </span>
                                </div>
                                <Progress
                                    value={Math.min((stats.averageResponseTime / 2000) * 100, 100)}
                                    className="h-2"
                                />
                            </div>

                            {isExpanded && (
                                <>
                                    <div className="border-t pt-2">
                                        <div className="text-xs font-medium mb-2">Top Endpoints</div>
                                        <div className="space-y-1">
                                            {stats.mostRequestedEndpoints.map((endpoint: any, index: number) => (
                                                <div key={index} className="flex justify-between text-xs">
                                                    <span className="truncate">{endpoint.endpoint}</span>
                                                    <Badge variant="secondary">{endpoint.count}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t pt-2">
                                        <div className="text-xs font-medium mb-2">Actions</div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={clearCache}
                                                className="text-xs"
                                            >
                                                Clear Cache
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="border-t pt-2">
                                        <div className="text-xs font-medium mb-2">Recommendations</div>
                                        <div className="space-y-1">
                                            {apiMonitor.getOptimizationRecommendations().map((rec, index) => (
                                                <div key={index} className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                                                    {rec}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ApiMonitor; 