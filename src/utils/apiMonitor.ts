interface ApiRequestLog {
  endpoint: string;
  timestamp: number;
  success: boolean;
  responseTime: number;
}

class ApiMonitor {
  private requestLogs: ApiRequestLog[] = [];
  private readonly MAX_LOGS = 1000; // Keep last 1000 requests

  logRequest(endpoint: string, success: boolean, responseTime: number): void {
    const log: ApiRequestLog = {
      endpoint,
      timestamp: Date.now(),
      success,
      responseTime,
    };

    this.requestLogs.push(log);

    // Keep only the last MAX_LOGS entries
    if (this.requestLogs.length > this.MAX_LOGS) {
      this.requestLogs = this.requestLogs.slice(-this.MAX_LOGS);
    }
  }

  getRequestStats(timeWindow: number = 60000): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    requestsPerMinute: number;
    mostRequestedEndpoints: Array<{ endpoint: string; count: number }>;
  } {
    const now = Date.now();
    const recentLogs = this.requestLogs.filter(log => now - log.timestamp < timeWindow);

    const totalRequests = recentLogs.length;
    const successfulRequests = recentLogs.filter(log => log.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const averageResponseTime = recentLogs.length > 0 
      ? recentLogs.reduce((sum, log) => sum + log.responseTime, 0) / recentLogs.length 
      : 0;

    // Calculate requests per minute
    const minutesInWindow = timeWindow / 60000;
    const requestsPerMinute = totalRequests / minutesInWindow;

    // Get most requested endpoints
    const endpointCounts = new Map<string, number>();
    recentLogs.forEach(log => {
      endpointCounts.set(log.endpoint, (endpointCounts.get(log.endpoint) || 0) + 1);
    });

    const mostRequestedEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      requestsPerMinute,
      mostRequestedEndpoints,
    };
  }

  getEndpointStats(endpoint: string, timeWindow: number = 60000): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastRequestTime: number | null;
  } {
    const now = Date.now();
    const endpointLogs = this.requestLogs.filter(
      log => log.endpoint === endpoint && now - log.timestamp < timeWindow
    );

    const totalRequests = endpointLogs.length;
    const successfulRequests = endpointLogs.filter(log => log.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const averageResponseTime = endpointLogs.length > 0 
      ? endpointLogs.reduce((sum, log) => sum + log.responseTime, 0) / endpointLogs.length 
      : 0;
    const lastRequestTime = endpointLogs.length > 0 
      ? Math.max(...endpointLogs.map(log => log.timestamp))
      : null;

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      lastRequestTime,
    };
  }

  clearLogs(): void {
    this.requestLogs = [];
  }

  // Check if an endpoint is being called too frequently
  isEndpointOverloaded(endpoint: string, maxRequestsPerMinute: number = 30): boolean {
    const stats = this.getEndpointStats(endpoint, 60000); // 1 minute window
    const requestsPerMinute = stats.totalRequests;
    return requestsPerMinute > maxRequestsPerMinute;
  }

  // Get recommendations for optimization
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];
    const stats = this.getRequestStats();

    if (stats.requestsPerMinute > 50) {
      recommendations.push('High request rate detected. Consider implementing more aggressive caching.');
    }

    if (stats.averageResponseTime > 2000) {
      recommendations.push('Slow response times detected. Consider optimizing API endpoints or implementing caching.');
    }

    const highTrafficEndpoints = stats.mostRequestedEndpoints.filter(ep => ep.count > 10);
    if (highTrafficEndpoints.length > 0) {
      recommendations.push(`High traffic endpoints detected: ${highTrafficEndpoints.map(ep => ep.endpoint).join(', ')}. Consider caching these endpoints.`);
    }

    return recommendations;
  }
}

export const apiMonitor = new ApiMonitor();
export default apiMonitor; 