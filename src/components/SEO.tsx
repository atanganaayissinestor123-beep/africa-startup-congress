import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  noIndex?: boolean;
  children?: React.ReactNode;
}

const SITE_NAME = "Africa Startup Congress 2027";
const SITE_URL = "https://africastartupcongress.com";
const DEFAULT_OG_IMAGE =
  "https://africastartupcongress.com/assets/images/logo.png";

// Optional: Use env variable for Google Analytics
const GA_ID = import.meta.env.VITE_GA_ID || "G-P8VBPSNM25";

export default function SEO({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  children,
}: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;

  // Ensure canonical is absolute
  const canonicalUrl = canonical
    ? canonical.startsWith("http")
      ? canonical
      : `${SITE_URL}${canonical}`
    : undefined;

  // Ensure OG image is absolute
  const fullOgImage = ogImage.startsWith("http")
    ? ogImage
    : `${SITE_URL}${ogImage}`;

  return (
    <Helmet>
      {/* =========================================
          BASIC SEO
      ========================================= */}
      <title>{fullTitle}</title>

      <meta name="description" content={description} />

      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* =========================================
          OPEN GRAPH (Facebook, LinkedIn, WhatsApp)
      ========================================= */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl || SITE_URL} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={fullOgImage} />

      {/* =========================================
          TWITTER / X CARDS
      ========================================= */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* =========================================
          MOBILE & THEME
      ========================================= */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <meta name="theme-color" content="#000000" />

      {/* =========================================
          GOOGLE ANALYTICS (GA4)
      ========================================= */}
      {GA_ID && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          />

          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];

                function gtag(){
                  dataLayer.push(arguments);
                }

                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      {/* =========================================
          EXTRA TAGS / STRUCTURED DATA
      ========================================= */}
      {children}
    </Helmet>
  );
}
