import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'profile';
    article?: {
        publishedTime?: string;
        modifiedTime?: string;
        author?: string;
        section?: string;
        tags?: string[];
    };
    noIndex?: boolean;
    canonicalUrl?: string;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description = 'ART TEBU - منصة رائدة في التعليم التقني والبرمجة. نقدم دورات احترافية في البرمجة، تطوير الويب، الذكاء الاصطناعي، والتطبيقات المحمولة.',
    keywords = 'تعليم البرمجة، دورات البرمجة، تطوير الويب، الذكاء الاصطناعي، التطبيقات المحمولة، JavaScript، React، Python، تعليم تقني، ART TEBU',
    image = '/assests/art_tebu.jpg',
    url,
    type = 'website',
    article,
    noIndex = false,
    canonicalUrl
}) => {
    const siteTitle = 'ART TEBU';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const imageUrl = image?.startsWith('http') ? image : `${typeof window !== 'undefined' ? window.location.origin : ''}${image}`;

    const structuredData = {
        "@context": "https://schema.org",
        "@type": type === 'article' ? 'Article' : 'Organization',
        "name": siteTitle,
        "url": typeof window !== 'undefined' ? window.location.origin : '',
        "logo": {
            "@type": "ImageObject",
            "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/assests/art_tebu.jpg`
        },
        "description": description,
        "foundingDate": "2025",
        "founder": {
            "@type": "Person",
            "name": "ART TEBU Team"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "areaServed": "EG",
            "availableLanguage": "Arabic"
        },
        "sameAs": [
            "https://facebook.com/arttebu",
            "https://twitter.com/arttebu",
            "https://linkedin.com/company/arttebu"
        ]
    };

    if (type === 'article' && article) {
        Object.assign(structuredData, {
            "@type": "Article",
            "headline": title,
            "description": description,
            "image": imageUrl,
            "author": {
                "@type": "Person",
                "name": article.author || "ART TEBU"
            },
            "publisher": {
                "@type": "Organization",
                "name": siteTitle,
                "logo": {
                    "@type": "ImageObject",
                    "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/assests/art_tebu.jpg`
                }
            },
            "datePublished": article.publishedTime,
            "dateModified": article.modifiedTime || article.publishedTime
        });
    }

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content="ART TEBU" />

            {/* Robots */}
            {noIndex && <meta name="robots" content="noindex,nofollow" />}
            {!noIndex && <meta name="robots" content="index,follow" />}

            {/* Canonical URL */}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            {!canonicalUrl && currentUrl && <link rel="canonical" href={currentUrl} />}

            {/* Language */}
            <html lang="ar" dir="rtl" />
            <meta httpEquiv="content-language" content="ar" />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:site_name" content={siteTitle} />
            <meta property="og:locale" content="ar_EG" />

            {/* Article specific Open Graph */}
            {type === 'article' && article && (
                <>
                    <meta property="article:published_time" content={article.publishedTime} />
                    <meta property="article:modified_time" content={article.modifiedTime || article.publishedTime} />
                    <meta property="article:author" content={article.author || 'ART TEBU'} />
                    <meta property="article:section" content={article.section || 'Technology'} />
                    {article.tags?.map((tag, index) => (
                        <meta key={index} property="article:tag" content={tag} />
                    ))}
                </>
            )}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
            <meta name="twitter:site" content="@arttebu" />
            <meta name="twitter:creator" content="@arttebu" />

            {/* Additional Meta Tags */}
            <meta name="theme-color" content="#3B82F6" />
            <meta name="msapplication-TileColor" content="#3B82F6" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content={siteTitle} />

            {/* Viewport */}
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>

            {/* Preconnect for performance */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </Helmet>
    );
};

export default SEO;
