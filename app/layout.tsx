
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://sakuraya.vercel.app'),
  title: {
    default: 'SakuRaya - Minimalist Duit Raya Planner',
    template: '%s | SakuRaya',
  },
  description: 'Plan your barakah, skip the bank queue. The minimalist Duit Raya & Gifting Planner designed for the modern Muslim during Ramadan and Raya.',
  keywords: ['Ramadan', 'Raya', 'Duit Raya', 'Finance Planner', 'Bank Status', 'Malaysia', 'Muslim'],
  authors: [{ name: 'SakuRaya Team' }],
  creator: 'SakuRaya',
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://sakuraya.vercel.app',
    title: 'SakuRaya - Minimalist Duit Raya Planner',
    description: 'Plan your barakah, skip the bank queue. The minimalist Duit Raya & Gifting Planner.',
    siteName: 'SakuRaya',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SakuRaya - Minimalist Duit Raya Planner',
    description: 'Plan your barakah, skip the bank queue. The minimalist Duit Raya & Gifting Planner.',
  },
}

import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
