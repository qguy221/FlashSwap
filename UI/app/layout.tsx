import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

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
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 min-h-screen`}>
        <div className="relative">
          {/* Background Effects */}
          <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div className="fixed inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10" />

          {/* Content */}
          <div className="relative z-10">{children}</div>
        </div>
      </body>
    </html>
  )
}
