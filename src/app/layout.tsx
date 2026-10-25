import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans_JP } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_NAME, SITE_URL, SITE_TAGLINE, SITE_DESCRIPTION, GA_ID } from "@/lib/constants";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "昆布", "こんぶ", "kombu", "だし昆布", "利尻昆布", "羅臼昆布", "日高昆布", "真昆布",
    "塩昆布", "とろろ昆布", "昆布茶", "昆布だし", "昆布レシピ",
    "昆布通販", "昆布ギフト", "北海道昆布",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", sizes: "256x256", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION ? {
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION },
  } : {}),
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "konbu-suki",
  url: SITE_URL,
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  inLanguage: "ja",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} h-full antialiased light`} style={{ colorScheme: "light" }}>
      <head>
        <meta name="color-scheme" content="light only" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-[family-name:var(--font-noto-sans-jp)]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }} />
        <SiteHeader />
        {children}
        <SiteFooter />
        <Analytics />
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');
document.addEventListener('click',function(e){var t=e.target.closest('[data-ga-event]');if(t){gtag('event',t.dataset.gaEvent,{product_name:t.dataset.gaProduct||'',product_id:t.dataset.gaProductId||'',page_path:location.pathname})}});`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
