import type { Metadata, Viewport } from 'next'
import { DM_Sans, Sora } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { SetupGuard } from '@/components/setup-wizard'
import Script from 'next/script'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans',
  display: 'swap',
})

const sora = Sora({ 
  subsets: ["latin"],
  variable: '--font-sora',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LoanMatters - AI-Powered Education Loan Clarity',
  description: 'Cut through the noise with data-driven insights for STEM students planning international degrees. Compare loans, estimate costs, and calculate ROI.',
  keywords: ['education loan', 'STEM students', 'international study', 'loan comparison', 'ROI calculator'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LoanMatters',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    title: 'LoanMatters - AI-Powered Education Loan Clarity',
    description: 'Cut through the noise with data-driven insights for STEM students.',
    siteName: 'LoanMatters',
  },
}

export const viewport: Viewport = {
  themeColor: '#F8F6F3',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${dmSans.variable} ${sora.variable} font-sans antialiased`}>
        <AuthProvider>
          <SetupGuard>
            {children}
          </SetupGuard>
          <PWAInstallPrompt />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registered:', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
