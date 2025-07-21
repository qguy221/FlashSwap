const { SeiMCP } = require("../lib/sei-mcp")
const { AgentReasoningEngine } = require("../lib/agent-reasoning")
const fs = require("fs")
const path = require("path")

class FlashArbAgent {
  constructor() {
    this.seiMCP = null
    this.reasoningEngine = new AgentReasoningEngine()
    this.isRunning = false
    this.cycleCount = 0
    this.stats = {
      totalOpportunities: 0,
      executedTrades: 0,
      successfulTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      avgExecutionTime: 0,
      startTime: Date.now(),
      lastActivity: Date.now(),
    }

    // Ensure logs directory exists
    this.logsDir = path.join(__dirname, "../logs")
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true })
    }

    this.logFile = path.join(this.logsDir, "agent-activity.log")
    this.decisionsFile = path.join(this.logsDir, "agent-decisions.json")
  }

  async initialize() {
    console.log("🤖 ===== FLASHARB.AI AUTONOMOUS AGENT =====")
    console.log("🏆 Built for Sei AI Accelathon 2024")
    console.log("⚡ Leveraging Sei Network's sub-400ms finality")
    console.log("🧠 True AI reasoning and decision making")
    console.log("=" * 50)

    try {
      // Initialize Sei MCP with testnet configuration
      this.seiMCP = new SeiMCP({
        rpcUrl: process.env.SEI_RPC_URL || "https://rpc-testnet.sei-apis.com",
        chainId: "atlantic-2",
        mnemonic: process.env.AGENT_MNEMONIC || "your test mnemonic here for demo purposes only",
        gasPrice: "0.001usei",
        contractAddress: process.env.FLASHARB_CONTRACT || "sei1flasharb7x8ahr3wjsdutnpyqsl4k2t5k4ejk4qgk",
      })

      await this.seiMCP.initialize()

      // Check agent balance and network status
      const balance = await this.seiMCP.getBalance()
      const networkStatus = await this.seiMCP.getNetworkStatus()

      console.log(`\n💰 Agent Balance: ${balance.sei.toFixed(6)} SEI ($${balance.usd.toFixed(2)})`)
      console.log(`🌐 Network: ${networkStatus.chainId} (${networkStatus.status.toUpperCase()})`)
      console.log(`📊 Block Height: ${networkStatus.blockHeight}`)
      console.log(`⚡ Network Latency: ${networkStatus.latency}ms`)
      console.log(`📍 Agent Address: ${this.seiMCP.getAddress()}`)
      console.log(`⚙️  Contract: ${this.seiMCP.getContractAddress()}`)

      if (networkStatus.latency > 400) {
        console.log("⚠️  WARNING: Network latency above 400ms - arbitrage advantage reduced")
      } else {
        console.log("✅ OPTIMAL: Network latency under 400ms - arbitrage advantage confirmed")
      }

      this.log("FlashArb.AI Agent initialized successfully")
      console.log("\n✅ FLASHARB.AI AGENT READY FOR AUTONOMOUS OPERATION")

      return true
    } catch (error) {
      console.error("❌ Agent initialization failed:", error)
      this.log(`Initialization failed: ${error.message}`)
      return false
    }
  }

  async startAutonomousLoop() {
    if (this.isRunning) {
      console.log("⚠️  Agent is already running")
      return
    }

    this.isRunning = true
    this.stats.startTime = Date.now()

    console.log("\n🚀 ===== STARTING AUTONOMOUS OPERATION =====")
    console.log("🔄 Agent Loop: Scan → Reason → Execute → Learn (every 15 seconds)")
    console.log("🧠 AI Decision Engine: Active with transparent reasoning")
    console.log("⚡ Sei Network: Sub-400ms execution advantage")
    console.log("📊 Live Monitoring: All decisions logged with explanations")
    console.log("🤖 Full Autonomy: No human intervention required")
    console.log("\n📈 LIVE AGENT ACTIVITY:\n")

    // Main autonomous loop - every 15 seconds
    const agentLoop = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(agentLoop)
        return
      }

      try {
        await this.executeAgentCycle()
      } catch (error) {
        console.error("❌ Agent cycle failed:", error)
        this.log(`Cycle ${this.cycleCount} failed: ${error.message}`)
      }
    }, 15000) // 15 second cycles

    // Performance reporting - every 60 seconds
    const reportingLoop = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(reportingLoop)
        return
      }
      this.reportLivePerformance()
    }, 60000)

    // Save decisions periodically - every 30 seconds
    const saveLoop = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(saveLoop)
        return
      }
      this.saveDecisionHistory()
    }, 30000)

    // Graceful shutdown handler
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down FlashArb.AI Agent...")
      this.isRunning = false
      clearInterval(agentLoop)
      clearInterval(reportingLoop)
      clearInterval(saveLoop)
      this.generateFinalReport()
      process.exit(0)
    })

    // Keep the process alive
    process.on("SIGTERM", () => {
      console.log("\n🛑 Received SIGTERM, shutting down gracefully...")
      this.isRunning = false
    })
  }

  async executeAgentCycle() {
    const cycleStart = Date.now()
    this.cycleCount++

    console.log(`\n🔄 ===== AGENT CYCLE ${this.cycleCount} =====`)
    console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`)

    try {
      // STEP 1: SCAN FOR OPPORTUNITIES
      console.log(`\n🔍 STEP 1: SCANNING DEX MARKETS...`)
      const opportunities = await this.seiMCP.scanDEXPrices()
      this.stats.totalOpportunities += opportunities.length

      if (opportunities.length === 0) {
        console.log("📊 No arbitrage opportunities detected in current market conditions")
        console.log("👁️  Agent Status: MONITORING - Waiting for profitable opportunities")
        return
      }

      console.log(`🎯 FOUND ${opportunities.length} POTENTIAL OPPORTUNITIES`)
      opportunities.forEach((opp, index) => {
        console.log(
          `  ${index + 1}. ${opp.tokenA}/${opp.tokenB}: ${(opp.spread * 100).toFixed(2)}% spread, $${opp.profitPotential.toFixed(2)} potential`,
        )
      })

      // STEP 2: AI REASONING AND DECISION MAKING
      console.log(`\n🧠 STEP 2: AI REASONING ENGINE ANALYSIS...`)
      const analyzedOpportunities = []

      for (const opportunity of opportunities) {
        const marketConditions = await this.getMarketConditions()
        const balance = await this.seiMCP.getBalance()

        console.log(`\n🤔 Analyzing: ${opportunity.id}`)
        const decision = this.reasoningEngine.analyzeOpportunity(opportunity, marketConditions, balance.usd)

        analyzedOpportunities.push({
          opportunity,
          decision,
          marketConditions,
        })
      }

      // STEP 3: PRIORITIZE AND EXECUTE
      console.log(`\n⚡ STEP 3: EXECUTION DECISION...`)
      const executableOpportunities = analyzedOpportunities
        .filter((item) => item.decision.action === "EXECUTE")
        .sort((a, b) => b.decision.executionPriority - a.decision.executionPriority)

      if (executableOpportunities.length === 0) {
        console.log("🤖 AI AGENT DECISION: No opportunities meet execution criteria")

        // Log reasons for skipping
        const skippedReasons = analyzedOpportunities
          .filter((item) => item.decision.action === "SKIP")
          .map((item) => `${item.opportunity.tokenA}/${item.opportunity.tokenB}: ${item.decision.reasoning}`)

        if (skippedReasons.length > 0) {
          console.log("❌ OPPORTUNITIES SKIPPED:")
          skippedReasons.forEach((reason) => console.log(`  • ${reason}`))
        }

        const monitoredOpps = analyzedOpportunities.filter((item) => item.decision.action === "MONITOR")
        if (monitoredOpps.length > 0) {
          console.log(`👁️  MONITORING ${monitoredOpps.length} opportunities for better conditions`)
        }

        return
      }

      // EXECUTE TOP OPPORTUNITY
      const topOpportunity = executableOpportunities[0]
      console.log(`\n🚀 ===== EXECUTING TOP OPPORTUNITY =====`)
      console.log(`🎯 Selected: ${topOpportunity.opportunity.tokenA}/${topOpportunity.opportunity.tokenB}`)
      console.log(`📊 Spread: ${(topOpportunity.opportunity.spread * 100).toFixed(2)}%`)
      console.log(`💰 Expected Profit: $${topOpportunity.decision.expectedProfit.toFixed(2)}`)
      console.log(`🎯 AI Confidence: ${(topOpportunity.decision.confidence * 100).toFixed(1)}%`)
      console.log(`🚀 Priority Score: ${topOpportunity.decision.executionPriority.toFixed(2)}`)
      console.log(`🧠 AI Reasoning: ${topOpportunity.decision.reasoning}`)

      const executionStart = Date.now()
      const result = await this.seiMCP.executeArbitrage(topOpportunity.opportunity)
      const executionTime = Date.now() - executionStart

      this.stats.executedTrades++
      this.stats.avgExecutionTime = (this.stats.avgExecutionTime + executionTime) / 2

      // STEP 4: LEARN FROM RESULT
      console.log(`\n📚 STEP 4: LEARNING FROM EXECUTION RESULT...`)
      this.reasoningEngine.learnFromResult(topOpportunity.decision, result, topOpportunity.opportunity.id)

      if (result.success) {
        this.stats.successfulTrades++
        this.stats.totalProfit += result.profit || 0

        console.log(`\n✅ ===== EXECUTION SUCCESSFUL =====`)
        console.log(`💵 Actual Profit: $${(result.profit || 0).toFixed(2)}`)
        console.log(`📝 Transaction Hash: ${result.txHash}`)
        console.log(`⛽ Gas Used: ${(result.gasUsed || 0).toFixed(6)} SEI`)
        console.log(`⏱️  Execution Time: ${result.executionTime}ms`)
        console.log(`📊 Block Height: ${result.blockHeight || "N/A"}`)
        console.log(`🎯 Success Rate: ${((this.stats.successfulTrades / this.stats.executedTrades) * 100).toFixed(1)}%`)

        this.log(
          `SUCCESS: ${topOpportunity.opportunity.id}, Profit: $${(result.profit || 0).toFixed(2)}, Tx: ${result.txHash}`,
        )
      } else {
        this.stats.totalLoss += topOpportunity.decision.maxLoss

        console.log(`\n❌ ===== EXECUTION FAILED =====`)
        console.log(`💔 Error: ${result.error}`)
        console.log(`⏱️  Execution Time: ${result.executionTime}ms`)
        console.log(`📊 Adjusting strategy based on failure...`)

        this.log(`FAILED: ${topOpportunity.opportunity.id}, Error: ${result.error}`)
      }

      const cycleTime = Date.now() - cycleStart
      console.log(`\n⏱️  CYCLE ${this.cycleCount} COMPLETED IN ${cycleTime}ms`)
      console.log(`🤖 Agent Status: ${this.isRunning ? "ACTIVE" : "STOPPING"} - Next cycle in 15 seconds`)

      this.stats.lastActivity = Date.now()
    } catch (error) {
      console.error(`❌ Cycle ${this.cycleCount} execution error:`, error)
      this.log(`Cycle ${this.cycleCount} error: ${error.message}`)
    }
  }

  async getMarketConditions() {
    try {
      const networkStatus = await this.seiMCP.getNetworkStatus()
      const hour = new Date().getHours()

      // Simulate market conditions based on time and network status
      const volatility = 0.02 + Math.random() * 0.06 // 2-8% volatility
      const liquidity = 500000 + Math.random() * 1500000 // $500k-$2M liquidity
      const timeOfDay = hour / 24 // 0-1 scale
      const networkCongestion = networkStatus.latency > 500 ? 0.8 : networkStatus.latency > 200 ? 0.4 : 0.1

      // Market trend based on volatility and time
      let marketTrend = "sideways"
      if (volatility > 0.05 && hour >= 8 && hour <= 20) {
        marketTrend = Math.random() > 0.5 ? "bullish" : "bearish"
      } else if (volatility < 0.03) {
        marketTrend = "sideways"
      }

      return {
        volatility,
        liquidity,
        gasPrice: networkStatus.gasPrice / 1000000, // Convert to SEI
        networkCongestion,
        timeOfDay,
        marketTrend,
      }
    } catch (error) {
      console.error("❌ Failed to get market conditions:", error)
      return {
        volatility: 0.03,
        liquidity: 1000000,
        gasPrice: 0.001,
        networkCongestion: 0.3,
        timeOfDay: 0.5,
        marketTrend: "sideways",
      }
    }
  }

  reportLivePerformance() {
    const uptime = Date.now() - this.stats.startTime
    const uptimeHours = uptime / (1000 * 60 * 60)
    const successRate =
      this.stats.executedTrades > 0 ? (this.stats.successfulTrades / this.stats.executedTrades) * 100 : 0
    const netProfit = this.stats.totalProfit - this.stats.totalLoss
    const profitPerHour = uptimeHours > 0 ? netProfit / uptimeHours : 0

    console.log(`\n📊 ===== LIVE PERFORMANCE REPORT =====`)
    console.log(`⏰ Uptime: ${uptimeHours.toFixed(1)} hours`)
    console.log(`🔄 Cycles Completed: ${this.cycleCount}`)
    console.log(`🎯 Opportunities Scanned: ${this.stats.totalOpportunities}`)
    console.log(`⚡ Trades Executed: ${this.stats.executedTrades}`)
    console.log(`✅ Success Rate: ${successRate.toFixed(1)}%`)
    console.log(`💰 Total Profit: $${this.stats.totalProfit.toFixed(2)}`)
    console.log(`💸 Total Loss: $${this.stats.totalLoss.toFixed(2)}`)
    console.log(`📈 Net Profit: $${netProfit.toFixed(2)}`)
    console.log(`💵 Profit/Hour: $${profitPerHour.toFixed(2)}`)
    console.log(`⚡ Avg Execution: ${this.stats.avgExecutionTime.toFixed(0)}ms`)

    // AI Performance Metrics
    const aiMetrics = this.reasoningEngine.getPerformanceMetrics()
    console.log(`\n🧠 AI REASONING PERFORMANCE:`)
    console.log(`🎯 Total Decisions: ${aiMetrics.totalDecisions}`)
    console.log(`⚡ Execution Rate: ${(aiMetrics.executionRate * 100).toFixed(1)}%`)
    console.log(`✅ AI Success Rate: ${(aiMetrics.successRate * 100).toFixed(1)}%`)
    console.log(`💰 Avg AI Profit: $${aiMetrics.avgProfit.toFixed(2)}`)
    console.log(`⚠️  Avg Risk Score: ${(aiMetrics.avgRisk * 100).toFixed(1)}%`)
    console.log(`📚 Learning Progress: ${(aiMetrics.learningProgress * 100).toFixed(1)}%`)
    console.log(`🎯 Profit Accuracy: ${(aiMetrics.profitAccuracy * 100).toFixed(1)}%`)
    console.log(`=====================================`)

    this.log(
      `Performance: ${this.cycleCount} cycles, ${this.stats.executedTrades} trades, ${successRate.toFixed(1)}% success, $${netProfit.toFixed(2)} net profit`,
    )
  }

  saveDecisionHistory() {
    try {
      const recentDecisions = this.reasoningEngine.getRecentDecisions(50)
      const performanceMetrics = this.reasoningEngine.getPerformanceMetrics()

      const data = {
        timestamp: Date.now(),
        agentStats: this.stats,
        aiMetrics: performanceMetrics,
        recentDecisions: recentDecisions,
        cycleCount: this.cycleCount,
      }

      fs.writeFileSync(this.decisionsFile, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error("❌ Failed to save decision history:", error)
    }
  }

  generateFinalReport() {
    const uptime = Date.now() - this.stats.startTime
    const uptimeHours = uptime / (1000 * 60 * 60)
    const successRate =
      this.stats.executedTrades > 0 ? (this.stats.successfulTrades / this.stats.executedTrades) * 100 : 0
    const netProfit = this.stats.totalProfit - this.stats.totalLoss
    const aiMetrics = this.reasoningEngine.getPerformanceMetrics()

    console.log(`\n🏁 ===== FLASHARB.AI FINAL REPORT =====`)
    console.log(`⏰ Total Runtime: ${uptimeHours.toFixed(2)} hours`)
    console.log(`🔄 Agent Cycles: ${this.cycleCount}`)
    console.log(`🎯 Opportunities: ${this.stats.totalOpportunities}`)
    console.log(`⚡ Executions: ${this.stats.executedTrades}`)
    console.log(`✅ Success Rate: ${successRate.toFixed(1)}%`)
    console.log(`💰 Net Profit: $${netProfit.toFixed(2)}`)
    console.log(`📊 ROI: ${this.stats.totalProfit > 0 ? ((netProfit / 10000) * 100).toFixed(2) : "0.00"}%`)
    console.log(`🧠 AI Decisions: ${aiMetrics.totalDecisions}`)
    console.log(`🎯 AI Accuracy: ${(aiMetrics.profitAccuracy * 100).toFixed(1)}%`)
    console.log(`📚 Learning: ${(aiMetrics.learningProgress * 100).toFixed(1)}%`)
    console.log(`\n🏆 FlashArb.AI Agent completed successfully!`)
    console.log(`⚡ Built for Sei AI Accelathon 2024`)
    console.log(`🤖 Autonomous DeFi Agent - The Future is Here`)
    console.log(`=====================================`)

    this.saveDecisionHistory()
    this.log(
      `Agent shutdown. Final stats: ${this.cycleCount} cycles, $${netProfit.toFixed(2)} profit, ${successRate.toFixed(1)}% success`,
    )
  }

  log(message) {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message}\n`

    try {
      fs.appendFileSync(this.logFile, logEntry)
    } catch (error) {
      console.error("❌ Failed to write to log file:", error)
    }
  }

  stop() {
    console.log("\n🛑 Stopping FlashArb.AI Agent...")
    this.isRunning = false
  }
}

// Main execution
async function main() {
  const agent = new FlashArbAgent()

  const initialized = await agent.initialize()
  if (!initialized) {
    console.error("❌ Failed to initialize agent")
    process.exit(1)
  }

  await agent.startAutonomousLoop()
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error)
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})

// Start the agent
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Agent startup failed:", error)
    process.exit(1)
  })
}

module.exports = { FlashArbAgent }
