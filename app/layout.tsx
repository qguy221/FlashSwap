import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "next-themes"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FlashArb.AI - Autonomous Arbitrage Agent",
  description:
    "The world's first fully autonomous DeFi agent built native on Sei Network. Scans, reasons, and executes arbitrage opportunities at machine speed with sub-400ms finality.",
  keywords: "sei, arbitrage, ai-agent, defi, autonomous, mcp, flasharb, sei-network, crypto, trading",
  authors: [{ name: "FlashArb.AI Team" }],
  openGraph: {
    title: "FlashArb.AI - Autonomous Arbitrage Agent",
    description: "Built for Sei AI Accelathon 2024 - Winner of DeFi & Payments Track",
    url: "https://flasharb-ai.vercel.app",
    siteName: "FlashArb.AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FlashArb.AI - Autonomous Arbitrage Agent on Sei Network",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlashArb.AI - Autonomous Arbitrage Agent",
    description: "The world's first fully autonomous DeFi agent built native on Sei Network",
    images: ["/og-image.png"],
    creator: "@FlashArbAI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="relative min-h-screen bg-background">
            {/* Enhanced Background Effects */}
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5" />
            <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20 animate-gradient-x" />
            {/* Content */}
            <div className="relative z-10">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
