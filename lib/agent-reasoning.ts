export interface MarketCondition {
  volatility: number
  liquidity: number
  gasPrice: number
  networkCongestion: number
  timeOfDay: number
  marketTrend: "bullish" | "bearish" | "sideways"
}

export interface RiskFactors {
  slippageRisk: number
  liquidityRisk: number
  gasRisk: number
  timingRisk: number
  counterpartyRisk: number
  marketRisk: number
}

export interface AgentDecision {
  action: "EXECUTE" | "SKIP" | "RETRY" | "MONITOR"
  confidence: number
  reasoning: string
  riskScore: number
  expectedProfit: number
  maxLoss: number
  executionPriority: number
  timestamp: number
}

export interface DecisionLog {
  opportunityId: string
  decision: AgentDecision
  actualResult?: any
  timestamp: number
}

export class AgentReasoningEngine {
  private performanceHistory: DecisionLog[] = []
  private strategyWeights = {
    profitThreshold: 50, // Minimum profit in USD
    riskTolerance: 0.3, // Maximum risk score (0-1)
    confidenceThreshold: 0.75, // Minimum confidence (0-1)
    gasEfficiency: 0.15, // Gas cost as % of profit
    timingOptimization: 0.05, // Timing factor weight
  }

  private learningRate = 0.02 // How fast the agent adapts

  constructor() {
    console.log("🧠 Agent Reasoning Engine initialized")
    console.log(`📊 Strategy Weights:`, this.strategyWeights)
  }

  analyzeOpportunity(opportunity: any, marketConditions: MarketCondition, agentBalance: number): AgentDecision {
    const analysisStart = Date.now()

    console.log(`\n🤔 ANALYZING OPPORTUNITY: ${opportunity.id}`)
    console.log(`📊 Token Pair: ${opportunity.tokenA}/${opportunity.tokenB}`)
    console.log(`🔄 DEX Route: ${opportunity.dexA} → ${opportunity.dexB}`)
    console.log(`📈 Spread: ${(opportunity.spread * 100).toFixed(2)}%`)
    console.log(`💰 Potential Profit: $${opportunity.profitPotential.toFixed(2)}`)

    // Step 1: Calculate comprehensive risk factors
    const riskFactors = this.calculateRiskFactors(opportunity, marketConditions)
    console.log(`⚠️  Risk Assessment:`, {
      slippage: `${(riskFactors.slippageRisk * 100).toFixed(1)}%`,
      liquidity: `${(riskFactors.liquidityRisk * 100).toFixed(1)}%`,
      gas: `${(riskFactors.gasRisk * 100).toFixed(1)}%`,
      timing: `${(riskFactors.timingRisk * 100).toFixed(1)}%`,
      market: `${(riskFactors.marketRisk * 100).toFixed(1)}%`,
    })

    // Step 2: Analyze profit potential with risk adjustment
    const profitAnalysis = this.analyzeProfitPotential(opportunity, riskFactors, agentBalance)
    console.log(`💵 Profit Analysis:`, {
      expected: `$${profitAnalysis.expectedProfit.toFixed(2)}`,
      probability: `${(profitAnalysis.profitProbability * 100).toFixed(1)}%`,
      roi: `${(profitAnalysis.roi * 100).toFixed(1)}%`,
      maxLoss: `$${profitAnalysis.maxLoss.toFixed(2)}`,
    })

    // Step 3: Evaluate market timing and conditions
    const timingAnalysis = this.analyzeMarketTiming(marketConditions)
    console.log(`⏰ Timing Analysis:`, {
      score: `${(timingAnalysis.timingScore * 100).toFixed(1)}%`,
      urgency: `${(timingAnalysis.urgency * 100).toFixed(1)}%`,
      phase: timingAnalysis.marketPhase,
    })

    // Step 4: Make intelligent decision using weighted scoring
    const decision = this.makeIntelligentDecision(
      opportunity,
      riskFactors,
      profitAnalysis,
      timingAnalysis,
      marketConditions,
    )

    // Step 5: Log detailed reasoning
    this.logDetailedReasoning(decision, opportunity, riskFactors, profitAnalysis, timingAnalysis)

    const analysisTime = Date.now() - analysisStart
    console.log(`🧠 Analysis completed in ${analysisTime}ms`)

    return decision
  }

  private calculateRiskFactors(opportunity: any, market: MarketCondition): RiskFactors {
    // Slippage risk based on spread and market volatility
    const slippageRisk = Math.min(1.0, (opportunity.spread < 0.01 ? 0.7 : 0.2) + market.volatility * 0.5)

    // Liquidity risk based on market liquidity and token pair
    const liquidityRisk = Math.min(
      1.0,
      (market.liquidity < 100000 ? 0.8 : 0.1) +
        (opportunity.tokenA === "SEI" || opportunity.tokenB === "SEI" ? 0.0 : 0.2),
    )

    // Gas risk based on current gas prices and network congestion
    const gasRisk = Math.min(1.0, (market.gasPrice > 0.002 ? 0.6 : 0.1) + market.networkCongestion * 0.3)

    // Timing risk based on network congestion and time of day
    const timingRisk = Math.min(
      1.0,
      (market.networkCongestion > 0.7 ? 0.5 : 0.1) + (market.timeOfDay < 0.3 || market.timeOfDay > 0.8 ? 0.2 : 0.0), // Off-peak hours
    )

    // Market risk based on overall market conditions
    const marketRisk = Math.min(
      1.0,
      (market.volatility > 0.05 ? 0.4 : 0.1) + (market.marketTrend === "bearish" ? 0.3 : 0.0),
    )

    // Base counterparty risk for DEX interactions
    const counterpartyRisk = 0.05

    return {
      slippageRisk,
      liquidityRisk,
      gasRisk,
      timingRisk,
      counterpartyRisk,
      marketRisk,
    }
  }

  private analyzeProfitPotential(
    opportunity: any,
    risks: RiskFactors,
    balance: number,
  ): {
    expectedProfit: number
    maxLoss: number
    profitProbability: number
    roi: number
  } {
    const baseProfit = opportunity.profitPotential
    const overallRisk = Object.values(risks).reduce((sum, risk) => sum + risk, 0) / 6

    // Risk-adjusted expected profit
    const riskAdjustment = Math.max(0.1, 1 - overallRisk)
    const expectedProfit = baseProfit * riskAdjustment

    // Maximum potential loss (gas + slippage)
    const maxLoss = opportunity.gasEstimate * 450 + baseProfit * risks.slippageRisk * 0.5 // SEI price ~$0.45

    // Probability of profitable execution
    const profitProbability = opportunity.confidence * riskAdjustment * (1 - Math.max(0, overallRisk - 0.3)) // Penalty for high risk

    // Return on investment based on required capital
    const requiredCapital = Math.max(balance * 0.05, 1000) // 5% of balance or $1000 minimum
    const roi = expectedProfit / requiredCapital

    return {
      expectedProfit,
      maxLoss,
      profitProbability,
      roi,
    }
  }

  private analyzeMarketTiming(market: MarketCondition): {
    timingScore: number
    urgency: number
    marketPhase: "accumulation" | "trending" | "distribution" | "decline"
  } {
    const hour = new Date().getHours()
    const isActiveHours = hour >= 8 && hour <= 20 // 8 AM to 8 PM UTC (active trading)
    const isPeakHours = hour >= 13 && hour <= 17 // 1 PM to 5 PM UTC (peak trading)

    // Timing score based on multiple factors
    const timingScore =
      (isPeakHours ? 0.4 : isActiveHours ? 0.25 : 0.1) + // Time of day
      (market.volatility > 0.02 && market.volatility < 0.08 ? 0.3 : 0.1) + // Optimal volatility
      (market.networkCongestion < 0.5 ? 0.2 : 0.05) + // Low congestion
      (market.liquidity > 500000 ? 0.1 : 0.0) // High liquidity

    // Urgency based on market conditions
    const urgency = Math.min(
      1.0,
      market.volatility * 3 + // Higher volatility = more urgent
        (market.networkCongestion < 0.3 ? 0.3 : 0.0) + // Low congestion = good timing
        (market.marketTrend === "trending" ? 0.2 : 0.0), // Trending market = opportunities
    )

    // Determine market phase
    let marketPhase: "accumulation" | "trending" | "distribution" | "decline" = "trending"
    if (market.volatility < 0.01 && market.liquidity > 1000000) {
      marketPhase = "accumulation"
    } else if (market.volatility > 0.08 || market.liquidity < 100000) {
      marketPhase = "distribution"
    } else if (market.marketTrend === "bearish" && market.volatility > 0.05) {
      marketPhase = "decline"
    }

    return { timingScore, urgency, marketPhase }
  }

  private makeIntelligentDecision(
    opportunity: any,
    risks: RiskFactors,
    profit: any,
    timing: any,
    market: MarketCondition,
  ): AgentDecision {
    const overallRisk = Object.values(risks).reduce((sum, risk) => sum + risk, 0) / 6
    const riskScore = Math.min(1.0, overallRisk)

    let action: "EXECUTE" | "SKIP" | "RETRY" | "MONITOR" = "SKIP"
    let confidence = 0
    let reasoning = ""
    let executionPriority = 0

    // Decision matrix based on profit, risk, and market conditions
    if (
      profit.expectedProfit >= this.strategyWeights.profitThreshold &&
      profit.profitProbability >= this.strategyWeights.confidenceThreshold &&
      riskScore <= this.strategyWeights.riskTolerance &&
      timing.timingScore > 0.6
    ) {
      // HIGH CONFIDENCE EXECUTION
      action = "EXECUTE"
      confidence = Math.min(0.99, profit.profitProbability * (1 - riskScore) * timing.timingScore)
      reasoning = `🚀 EXECUTE: High profit ($${profit.expectedProfit.toFixed(2)}) with ${(profit.profitProbability * 100).toFixed(1)}% probability. Risk acceptable (${(riskScore * 100).toFixed(1)}%). Optimal market timing (${(timing.timingScore * 100).toFixed(1)}%).`
      executionPriority = profit.expectedProfit * profit.profitProbability * (1 - riskScore) * timing.timingScore
    } else if (
      profit.expectedProfit >= this.strategyWeights.profitThreshold * 0.7 &&
      profit.profitProbability >= this.strategyWeights.confidenceThreshold * 0.8 &&
      riskScore <= this.strategyWeights.riskTolerance * 1.2 &&
      timing.urgency > 0.7
    ) {
      // MODERATE CONFIDENCE EXECUTION
      action = "EXECUTE"
      confidence = Math.min(0.95, profit.profitProbability * (1 - riskScore) * 0.9)
      reasoning = `⚡ EXECUTE: Moderate profit ($${profit.expectedProfit.toFixed(2)}) with acceptable risk (${(riskScore * 100).toFixed(1)}%). High urgency detected (${(timing.urgency * 100).toFixed(1)}%). Market conditions: ${market.marketTrend}.`
      executionPriority = profit.expectedProfit * profit.profitProbability * (1 - riskScore) * 0.8
    } else if (
      profit.expectedProfit >= this.strategyWeights.profitThreshold * 0.5 &&
      timing.urgency > 0.8 &&
      riskScore <= this.strategyWeights.riskTolerance * 1.5
    ) {
      // RETRY WITH OPTIMIZATION
      action = "RETRY"
      confidence = 0.6
      reasoning = `🔄 RETRY: Moderate opportunity ($${profit.expectedProfit.toFixed(2)}) with high urgency. Will optimize parameters and retry. Current risk: ${(riskScore * 100).toFixed(1)}%.`
      executionPriority = profit.expectedProfit * 0.5
    } else if (
      opportunity.spread > 0.015 || // 1.5% spread
      profit.expectedProfit >= this.strategyWeights.profitThreshold * 0.3
    ) {
      // MONITOR FOR BETTER CONDITIONS
      action = "MONITOR"
      confidence = 0.4
      reasoning = `👁️ MONITOR: Potential detected (${(opportunity.spread * 100).toFixed(2)}% spread, $${profit.expectedProfit.toFixed(2)} profit) but conditions not optimal. Risk: ${(riskScore * 100).toFixed(1)}%. Monitoring for improvement.`
      executionPriority = profit.expectedProfit * 0.3
    } else {
      // SKIP OPPORTUNITY
      action = "SKIP"
      confidence = 0.1
      reasoning = `❌ SKIP: Insufficient profit ($${profit.expectedProfit.toFixed(2)} < $${this.strategyWeights.profitThreshold}) or high risk (${(riskScore * 100).toFixed(1)}% > ${(this.strategyWeights.riskTolerance * 100).toFixed(1)}%). Market: ${market.marketTrend}, Timing: ${(timing.timingScore * 100).toFixed(1)}%.`
      executionPriority = 0
    }

    return {
      action,
      confidence,
      reasoning,
      riskScore,
      expectedProfit: profit.expectedProfit,
      maxLoss: profit.maxLoss,
      executionPriority,
      timestamp: Date.now(),
    }
  }

  private logDetailedReasoning(
    decision: AgentDecision,
    opportunity: any,
    risks: RiskFactors,
    profit: any,
    timing: any,
  ): void {
    console.log(`\n🧠 ===== AGENT DECISION COMPLETE =====`)
    console.log(`🎯 DECISION: ${decision.action}`)
    console.log(`📊 CONFIDENCE: ${(decision.confidence * 100).toFixed(1)}%`)
    console.log(`⚠️  RISK SCORE: ${(decision.riskScore * 100).toFixed(1)}%`)
    console.log(`💰 EXPECTED PROFIT: $${decision.expectedProfit.toFixed(2)}`)
    console.log(`📉 MAX LOSS: $${decision.maxLoss.toFixed(2)}`)
    console.log(`🚀 PRIORITY: ${decision.executionPriority.toFixed(2)}`)
    console.log(`💭 REASONING: ${decision.reasoning}`)

    if (decision.action === "EXECUTE") {
      console.log(`\n✅ ===== EXECUTION APPROVED =====`)
      console.log(`🎯 Opportunity: ${opportunity.id}`)
      console.log(`📈 Spread: ${(opportunity.spread * 100).toFixed(2)}%`)
      console.log(`🔄 Route: ${opportunity.dexA} → ${opportunity.dexB}`)
      console.log(`⚡ Priority Score: ${decision.executionPriority.toFixed(2)}`)
      console.log(`🧠 AI Confidence: ${(decision.confidence * 100).toFixed(1)}%`)
    } else if (decision.action === "SKIP") {
      console.log(`\n❌ ===== OPPORTUNITY REJECTED =====`)
      console.log(`📊 Reason: ${decision.reasoning}`)
    }

    console.log(`=====================================\n`)
  }

  learnFromResult(decision: AgentDecision, actualResult: any, opportunityId: string): void {
    // Record the decision and result
    const decisionLog: DecisionLog = {
      opportunityId,
      decision,
      actualResult,
      timestamp: Date.now(),
    }

    this.performanceHistory.push(decisionLog)

    // Analyze performance and adjust strategy
    if (actualResult.success && decision.action === "EXECUTE") {
      const profitAccuracy = actualResult.profit / decision.expectedProfit

      if (profitAccuracy > 1.1) {
        // We were conservative, can be slightly more aggressive
        this.strategyWeights.profitThreshold *= 1 - this.learningRate
        this.strategyWeights.riskTolerance *= 1 + this.learningRate * 0.5
        console.log(
          `📚 Learning: Increasing aggression (profit exceeded expectations by ${((profitAccuracy - 1) * 100).toFixed(1)}%)`,
        )
      } else if (profitAccuracy < 0.8) {
        // We were too optimistic, be more conservative
        this.strategyWeights.profitThreshold *= 1 + this.learningRate
        this.strategyWeights.confidenceThreshold *= 1 + this.learningRate * 0.5
        console.log(
          `📚 Learning: Increasing conservatism (profit was ${((1 - profitAccuracy) * 100).toFixed(1)}% below expectations)`,
        )
      }
    } else if (!actualResult.success && decision.action === "EXECUTE") {
      // Failed execution - be more conservative
      this.strategyWeights.riskTolerance *= 1 - this.learningRate * 2
      this.strategyWeights.confidenceThreshold *= 1 + this.learningRate
      this.strategyWeights.profitThreshold *= 1 + this.learningRate * 1.5
      console.log(`📚 Learning: Failed execution detected, increasing conservatism significantly`)
    }

    // Keep only recent history (last 200 decisions)
    if (this.performanceHistory.length > 200) {
      this.performanceHistory = this.performanceHistory.slice(-200)
    }

    console.log(`📚 Agent learned from result. Total decisions: ${this.performanceHistory.length}`)
    console.log(`🎯 Current strategy weights:`, {
      profitThreshold: `$${this.strategyWeights.profitThreshold.toFixed(0)}`,
      riskTolerance: `${(this.strategyWeights.riskTolerance * 100).toFixed(1)}%`,
      confidenceThreshold: `${(this.strategyWeights.confidenceThreshold * 100).toFixed(1)}%`,
    })
  }

  getPerformanceMetrics(): {
    totalDecisions: number
    executionRate: number
    successRate: number
    avgProfit: number
    avgRisk: number
    learningProgress: number
    profitAccuracy: number
    strategyWeights: typeof this.strategyWeights
  } {
    if (this.performanceHistory.length === 0) {
      return {
        totalDecisions: 0,
        executionRate: 0,
        successRate: 0,
        avgProfit: 0,
        avgRisk: 0,
        learningProgress: 0,
        profitAccuracy: 0,
        strategyWeights: this.strategyWeights,
      }
    }

    const executions = this.performanceHistory.filter((h) => h.decision.action === "EXECUTE")
    const successful = executions.filter((h) => h.actualResult?.success)

    const executionRate = executions.length / this.performanceHistory.length
    const successRate = executions.length > 0 ? successful.length / executions.length : 0
    const avgProfit =
      successful.length > 0
        ? successful.reduce((sum, h) => sum + (h.actualResult?.profit || 0), 0) / successful.length
        : 0
    const avgRisk =
      this.performanceHistory.reduce((sum, h) => sum + h.decision.riskScore, 0) / this.performanceHistory.length
    const learningProgress = Math.min(1.0, this.performanceHistory.length / 100) // Progress towards 100 decisions

    // Calculate profit prediction accuracy
    const profitPredictions = successful.filter((h) => h.decision.expectedProfit > 0 && h.actualResult?.profit > 0)
    const profitAccuracy =
      profitPredictions.length > 0
        ? profitPredictions.reduce((sum, h) => {
            const accuracy = Math.min(2, h.actualResult.profit / h.decision.expectedProfit)
            return sum + accuracy
          }, 0) / profitPredictions.length
        : 0

    return {
      totalDecisions: this.performanceHistory.length,
      executionRate,
      successRate,
      avgProfit,
      avgRisk,
      learningProgress,
      profitAccuracy,
      strategyWeights: this.strategyWeights,
    }
  }

  getRecentDecisions(limit = 10): DecisionLog[] {
    return this.performanceHistory.slice(-limit).reverse()
  }
}

export default AgentReasoningEngine
