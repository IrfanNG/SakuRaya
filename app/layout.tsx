
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
// import { Toaster } from 'sonner' // Assuming sonner or just standard toaster later

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SakuRaya - Minimalist Duit Raya Planner',
  description: 'Plan your Duit Raya budget and monitor bank queues instantly.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        {/* <Toaster /> Add toaster later if needed */}
      </body>
    </html>
  )
}
