import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { RegisterServiceWorker } from '@/components/RegisterServiceWorker'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'TUNorth Robot Simulator',
  description: 'Web-Based Robot Programming Simulator for TUNorth',
  manifest: '/manifest.json'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className={`${inter.variable} ${jetbrainsMono.variable} dark h-full`}>
      <body className="h-full bg-slate-950 text-slate-100 antialiased overflow-hidden font-sans select-none">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  )
}
