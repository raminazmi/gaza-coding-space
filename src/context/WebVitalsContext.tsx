import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

// Declare gtag type for analytics
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

interface WebVitalsContextType {
    metrics: {
        CLS?: number;
        INP?: number;
        FCP?: number;
        LCP?: number;
        TTFB?: number;
    };
    reportMetric: (name: string, value: number) => void;
}

const WebVitalsContext = createContext<WebVitalsContextType | undefined>(undefined);

export function WebVitalsProvider({ children }: { children: ReactNode }) {
    const [metrics, setMetrics] = useState<WebVitalsContextType['metrics']>({});

    const reportMetric = (name: string, value: number) => {
        setMetrics(prev => ({ ...prev, [name]: value }));

        // Report to analytics or monitoring service
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', name, {
                event_category: 'Web Vitals',
                value: Math.round(name === 'CLS' ? value * 1000 : value),
                non_interaction: true,
            });
        }
    };

    useEffect(() => {
        // Measure and report Web Vitals
        onCLS(({ value }) => reportMetric('CLS', value));
        onINP(({ value }) => reportMetric('INP', value));
        onFCP(({ value }) => reportMetric('FCP', value));
        onLCP(({ value }) => reportMetric('LCP', value));
        onTTFB(({ value }) => reportMetric('TTFB', value));
    }, []);

    return (
        <WebVitalsContext.Provider value={{ metrics, reportMetric }}>
            {children}
        </WebVitalsContext.Provider>
    );
}

export function useWebVitals() {
    const context = useContext(WebVitalsContext);
    if (context === undefined) {
        throw new Error('useWebVitals must be used within a WebVitalsProvider');
    }
    return context;
}
