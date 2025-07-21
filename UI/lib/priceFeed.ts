export interface PriceData {
  dexA: number
  dexB: number
  spread: number
  volume: number
  liquidity: number
  timestamp: number
}

export interface MarketConditions {
  volatility: number
  trend: "bullish" | "bearish" | "sideways"
  confidence: number
}

// Simulate real DEX price feeds with realistic market behavior
export function generateRealisticPrice(basePrice: number, volatility: number): number {
  const drift = (Math.random() - 0.5) * 0.001 // Small drift
  const shock = Math.random() < 0.05 ? (Math.random() - 0.5) * 0.02 : 0 // 5% chance of price shock
  const noise = (Math.random() - 0.5) * volatility * 0.01

  return Math.max(0.01, basePrice * (1 + drift + shock + noise))
}

export function calculateSpread(priceA: number, priceB: number): number {
  const spread = Math.abs(priceA - priceB) / ((priceA + priceB) / 2)
  return +(spread * 100).toFixed(3)
}

export function calculateProfitPotential(spread: number, amount: number, gasEstimate = 0.02): number {
  const grossProfit = (spread / 100) * amount
  const netProfit = grossProfit - gasEstimate
  return Math.max(0, netProfit)
}

export function getMarketConditions(): MarketConditions {
  const volatility = 0.5 + Math.random() * 2 // 0.5% to 2.5%
  const trends = ["bullish", "bearish", "sideways"] as const
  const trend = trends[Math.floor(Math.random() * trends.length)]
  const confidence = 70 + Math.random() * 25 // 70-95%

  return { volatility, trend, confidence }
}

// Simulate live price feeds from multiple DEXs
export class LivePriceFeed {
  private basePrice = 1.0
  private volatility = 0.015

  constructor(initialPrice = 1.0, initialVolatility = 0.015) {
    this.basePrice = initialPrice
    this.volatility = initialVolatility
  }

  getLatestPrices(): PriceData {
    // Simulate SeiSwap price
    const dexA = generateRealisticPrice(this.basePrice, this.volatility)

    // Simulate Vortex price with slight delay/difference
    const dexB = generateRealisticPrice(this.basePrice * 1.001, this.volatility * 1.1)

    const spread = calculateSpread(dexA, dexB)
    const volume = 50000 + Math.random() * 200000
    const liquidity = 1000000 + Math.random() * 5000000

    // Update base price for next iteration
    this.basePrice = (dexA + dexB) / 2

    return {
      dexA,
      dexB,
      spread,
      volume,
      liquidity,
      timestamp: Date.now(),
    }
  }
}
