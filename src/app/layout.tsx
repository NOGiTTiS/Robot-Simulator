import type { Metadata } from 'next'
import { Prompt, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { RegisterServiceWorker } from '@/components/RegisterServiceWorker'

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-prompt'
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'TUNorth Robot Simulator',
  description: 'Web-Based Robot Programming Simulator for TUNorth',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon-32x32.png',
    shortcut: '/favicon-32x32.png',
    apple: '/logo.png'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${prompt.variable} ${inter.variable} ${jetbrainsMono.variable} dark h-full`}>
      <body className="h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased overflow-hidden font-sans select-none transition-colors duration-300">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  )
}

