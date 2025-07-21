export interface DecisionFactors {
  spread: number
  slippage: number
  gasPrice: number
  liquidity: number
  volatility: number
  networkLatency: number
  confidence: number
}

export interface AgentDecision {
  action: "EXECUTE" | "SKIP" | "MONITOR" | "RETRY"
  confidence: number
  reasoning: string
  profitEstimate: number
  riskScore: number
  executionPlan?: {
    amountIn: number
    expectedOut: number
    maxSlippage: number
    gasLimit: number
  }
}

export interface AgentConfig {
  minSpread: number
  maxSlippage: number
  minLiquidity: number
  maxRisk: number
  minProfit: number
  maxGasPrice: number
}

export class AutonomousAgent {
  private config: AgentConfig
  private learningData: Array<{
    decision: AgentDecision
    outcome: "success" | "failure" | "skipped"
    actualProfit: number
    timestamp: number
  }> = []

  constructor(config: AgentConfig) {
    this.config = config
  }

  // Advanced AI decision engine with learning capabilities
  makeDecision(factors: DecisionFactors): AgentDecision {
    const { spread, slippage, gasPrice, liquidity, volatility, networkLatency, confidence } = factors

    // Multi-factor risk assessment
    const riskScore = this.calculateRiskScore(factors)
    const profitEstimate = this.estimateProfit(factors)

    // AI reasoning logic
    let action: AgentDecision["action"] = "SKIP"
    let reasoning = ""
    let agentConfidence = 0

    if (spread < this.config.minSpread) {
      action = "SKIP"
      reasoning = `Spread too low (${spread.toFixed(3)}% < ${this.config.minSpread}%)`
      agentConfidence = 95
    } else if (slippage > this.config.maxSlippage) {
      action = "SKIP"
      reasoning = `Slippage risk too high (${(slippage * 100).toFixed(2)}%)`
      agentConfidence = 90
    } else if (liquidity < this.config.minLiquidity) {
      action = "MONITOR"
      reasoning = `Low liquidity ($${(liquidity / 1000).toFixed(0)}K), monitoring for improvement`
      agentConfidence = 75
    } else if (gasPrice > this.config.maxGasPrice) {
      action = "RETRY"
      reasoning = `Gas price too high, retrying in next cycle`
      agentConfidence = 80
    } else if (networkLatency > 500) {
      action = "RETRY"
      reasoning = `Network congestion (${networkLatency}ms), waiting for better conditions`
      agentConfidence = 85
    } else if (profitEstimate < this.config.minProfit) {
      action = "SKIP"
      reasoning = `Profit below threshold ($${profitEstimate.toFixed(2)} < $${this.config.minProfit})`
      agentConfidence = 88
    } else if (riskScore > this.config.maxRisk) {
      action = "MONITOR"
      reasoning = `Risk score too high (${riskScore.toFixed(1)}/10), monitoring market conditions`
      agentConfidence = 82
    } else {
      action = "EXECUTE"
      reasoning = `Optimal conditions: ${spread.toFixed(3)}% spread, low risk, high confidence`
      agentConfidence = Math.min(95, confidence * 0.9 + 10)
    }

    // Learning enhancement based on historical data
    const historicalSuccess = this.getHistoricalSuccessRate()
    agentConfidence = agentConfidence * (0.7 + historicalSuccess * 0.3)

    const decision: AgentDecision = {
      action,
      confidence: agentConfidence,
      reasoning,
      profitEstimate,
      riskScore,
      executionPlan:
        action === "EXECUTE"
          ? {
              amountIn: 1000, // $1000 default
              expectedOut: 1000 + profitEstimate,
              maxSlippage: slippage,
              gasLimit: 300000,
            }
          : undefined,
    }

    return decision
  }

  private calculateRiskScore(factors: DecisionFactors): number {
    const { spread, slippage, volatility, liquidity, networkLatency } = factors

    // Multi-dimensional risk calculation
    const spreadRisk = Math.max(0, (2 - spread) * 2) // Higher risk for lower spreads
    const slippageRisk = slippage * 100 // Direct slippage risk
    const volatilityRisk = volatility * 3 // Volatility multiplier
    const liquidityRisk = Math.max(0, (500000 - liquidity) / 100000) // Liquidity risk
    const latencyRisk = Math.max(0, (networkLatency - 200) / 100) // Network risk

    const totalRisk = (spreadRisk + slippageRisk + volatilityRisk + liquidityRisk + latencyRisk) / 5
    return Math.min(10, Math.max(0, totalRisk))
  }

  private estimateProfit(factors: DecisionFactors): number {
    const { spread, slippage, gasPrice } = factors
    const tradeAmount = 1000 // $1000 base trade

    const grossProfit = (spread / 100) * tradeAmount
    const slippageCost = (slippage / 100) * tradeAmount
    const gasCost = gasPrice * 0.0001 * 300000 // Estimated gas cost

    return Math.max(0, grossProfit - slippageCost - gasCost)
  }

  private getHistoricalSuccessRate(): number {
    if (this.learningData.length === 0) return 0.5

    const recentData = this.learningData.slice(-20) // Last 20 decisions
    const successes = recentData.filter((d) => d.outcome === "success").length
    return successes / recentData.length
  }

  // Record decision outcome for learning
  recordOutcome(decision: AgentDecision, outcome: "success" | "failure" | "skipped", actualProfit: number) {
    this.learningData.push({
      decision,
      outcome,
      actualProfit,
      timestamp: Date.now(),
    })

    // Keep only last 100 records for memory efficiency
    if (this.learningData.length > 100) {
      this.learningData = this.learningData.slice(-100)
    }
  }

  getPerformanceMetrics() {
    const totalDecisions = this.learningData.length
    const executions = this.learningData.filter((d) => d.decision.action === "EXECUTE")
    const successes = this.learningData.filter((d) => d.outcome === "success")
    const totalProfit = this.learningData.reduce((sum, d) => sum + d.actualProfit, 0)

    return {
      totalDecisions,
      executionRate: totalDecisions > 0 ? (executions.length / totalDecisions) * 100 : 0,
      successRate: executions.length > 0 ? (successes.length / executions.length) * 100 : 0,
      totalProfit,
      avgProfitPerTrade: executions.length > 0 ? totalProfit / executions.length : 0,
      learningProgress: Math.min(100, (totalDecisions / 50) * 100), // Progress towards 50 decisions
    }
  }
}
