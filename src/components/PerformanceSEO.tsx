import { Helmet } from 'react-helmet-async';

interface PerformanceSEOProps {
    title?: string;
    description?: string;
    canonical?: string;
}

export default function PerformanceSEO({
    title = "ART TEBU - منصة التعليم التقني الرائدة",
    description = "منصة رائدة في التعليم التقني والبرمجة. تعلم البرمجة، تطوير الويب، الذكاء الاصطناعي، والتطبيقات المحمولة مع خبراء معتمدين.",
    canonical
}: PerformanceSEOProps) {
    return (
        <Helmet>
            {/* Performance Optimization */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://gazacodingspace.mahmoudalbatran.com" />
            <link rel="preconnect" href="https://gazacodingspace.mahmoudalbatran.com" />

            {/* Resource Hints */}
            <link rel="prefetch" href="/articles" />
            <link rel="prefetch" href="/courses" />
            <link rel="prefetch" href="/services" />

            {/* Critical CSS - Inline for above-the-fold content */}
            <style type="text/css">{`
        body { font-family: system-ui, -apple-system, sans-serif; }
        .loading { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
      `}</style>

            {/* Core Web Vitals Optimization */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

            {/* Cache Control */}
            <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />

            {/* Performance Metrics */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "name": title,
                    "description": description,
                    "url": canonical || "https://arttebu.com",
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": {
                            "@type": "EntryPoint",
                            "urlTemplate": "https://arttebu.com/search?q={search_term_string}"
                        },
                        "query-input": "required name=search_term_string"
                    }
                })}
            </script>
        </Helmet>
    );
}
