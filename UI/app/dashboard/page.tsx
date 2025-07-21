"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  TrendingUp,
  Zap,
  Brain,
  Target,
  DollarSign,
  Clock,
  Shield,
  Network,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  RefreshCw,
  Bot,
  Globe,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

import { ethers } from 'ethers';

interface AgentMetrics {
  id: string
  type: "Scanner" | "Executor" | "Risk" | "Optimizer"
  status: "Active" | "Executing" | "Learning" | "Idle"
  performance: number
  profit24h: number
  accuracy: number
  decisions: number
  reasoning: string
}

interface ArbitrageOpportunity {
  id: string
  tokenPair: string
  dexA: string
  dexB: string
  spread: number
  profitPotential: number
  confidence: number
  riskScore: number
  decision: "EXECUTE" | "SKIP" | "MONITOR"
  reasoning: string
  timestamp: number
}

interface ExecutionResult {
  id: string
  opportunityId: string
  success: boolean
  profit: number
  executionTime: number
  txHash: string
  gasUsed: number
  timestamp: number
}

// Mock data for charts
const profitDataMock = [
  { time: "00:00", profit: 0, cumulative: 0 },
  { time: "04:00", profit: 234, cumulative: 234 },
  { time: "08:00", profit: 567, cumulative: 801 },
  { time: "12:00", profit: 892, cumulative: 1693 },
  { time: "16:00", profit: 1245, cumulative: 2938 },
  { time: "20:00", profit: 1567, cumulative: 4505 },
  { time: "24:00", profit: 1847, cumulative: 6352 },
]

export default function DashboardPage() {
  const [isAgentRunning, setIsAgentRunning] = useState(true)
  const [agents, setAgents] = useState<AgentMetrics[]>([])
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [executions, setExecutions] = useState<ExecutionResult[]>([])
  const [networkMetrics, setNetworkMetrics] = useState({
    seiLatency: 89,
    blockHeight: 5234567,
    gasPrice: 0.001,
    status: "healthy" as "healthy" | "degraded" | "offline",
  })
  const [profitData, setProfitData] =
    useState<Array<{ time: string; profit: number; cumulative: number }>>(profitDataMock)
  const [isLive, setIsLive] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    // Initialize agents
    setAgents([
      {
        id: "SCANNER-001",
        type: "Scanner",
        status: "Active",
        performance: 97.3,
        profit24h: 0,
        accuracy: 94.7,
        decisions: 156,
        reasoning: "Continuously scanning 15 DEXs for arbitrage opportunities",
      },
      {
        id: "EXECUTOR-001",
        type: "Executor",
        status: "Executing",
        performance: 98.1,
        profit24h: 2847.32,
        accuracy: 99.2,
        decisions: 89,
        reasoning: "Executing high-confidence arbitrage with 3.2% spread",
      },
      {
        id: "RISK-001",
        type: "Risk",
        status: "Learning",
        performance: 95.8,
        profit24h: -23.45,
        accuracy: 96.4,
        decisions: 23,
        reasoning: "Learning from recent market volatility patterns",
      },
      {
        id: "OPTIMIZER-001",
        type: "Optimizer",
        status: "Active",
        performance: 96.7,
        profit24h: 1234.56,
        accuracy: 97.8,
        decisions: 67,
        reasoning: "Optimizing gas usage and execution timing",
      },
    ])

    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update opportunities
      if (Math.random() > 0.7) {
        const newOpportunity: ArbitrageOpportunity = {
          id: `OPP-${Date.now()}`,
          tokenPair: `${["SEI", "USDC", "ATOM", "WETH"][Math.floor(Math.random() * 4)]}/${["USDC", "SEI"][Math.floor(Math.random() * 2)]}`,
          dexA: ["SeiSwap", "Vortex", "Astroport"][Math.floor(Math.random() * 3)],
          dexB: ["SeiSwap", "Vortex", "Astroport"][Math.floor(Math.random() * 3)],
          spread: Math.random() * 0.05 + 0.005,
          profitPotential: Math.random() * 500 + 50,
          confidence: Math.random() * 0.3 + 0.7,
          riskScore: Math.random() * 0.4 + 0.1,
          decision: Math.random() > 0.6 ? "EXECUTE" : Math.random() > 0.5 ? "MONITOR" : "SKIP",
          reasoning: "",
          timestamp: Date.now(),
        }

        // Add reasoning based on decision
        if (newOpportunity.decision === "EXECUTE") {
          newOpportunity.reasoning = `High profit potential ($${newOpportunity.profitPotential.toFixed(2)}) with ${(newOpportunity.confidence * 100).toFixed(1)}% confidence. Risk acceptable.`
        } else if (newOpportunity.decision === "MONITOR") {
          newOpportunity.reasoning = `Moderate opportunity. Monitoring for better entry conditions.`
        } else {
          newOpportunity.reasoning = `Insufficient profit or high risk. Skipping opportunity.`
        }

        setOpportunities((prev) => [newOpportunity, ...prev.slice(0, 9)])

        // Simulate execution if decision is EXECUTE
        if (newOpportunity.decision === "EXECUTE" && Math.random() > 0.1) {
          setTimeout(
            () => {
              const execution: ExecutionResult = {
                id: `EXEC-${Date.now()}`,
                opportunityId: newOpportunity.id,
                success: Math.random() > 0.03, // 97% success rate
                profit: newOpportunity.profitPotential * (0.8 + Math.random() * 0.4),
                executionTime: Math.random() * 200 + 50, // 50-250ms
                txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
                gasUsed: Math.random() * 0.002 + 0.001,
                timestamp: Date.now(),
              }

              setExecutions((prev) => [execution, ...prev.slice(0, 19)])

              // Update profit data
              setProfitData((prev) => {
                const newData = [
                  ...prev,
                  {
                    time: new Date().toLocaleTimeString(),
                    profit: execution.success ? execution.profit : 0,
                    cumulative:
                      prev.length > 0
                        ? prev[prev.length - 1].cumulative + (execution.success ? execution.profit : 0)
                        : 0,
                  },
                ]
                return newData.slice(-20) // Keep last 20 points
              })
            },
            Math.random() * 3000 + 1000,
          ) // 1-4 second delay
        }
      }

      // Update agent metrics
      setAgents((prev) =>
        prev.map((agent) => ({
          ...agent,
          performance: Math.max(85, Math.min(100, agent.performance + (Math.random() - 0.5) * 2)),
          profit24h: agent.type === "Executor" ? agent.profit24h + Math.random() * 50 : agent.profit24h,
          accuracy: Math.max(90, Math.min(100, agent.accuracy + (Math.random() - 0.5) * 1)),
        })),
      )

      // Update network metrics
      setNetworkMetrics((prev) => ({
        ...prev,
        seiLatency: Math.max(50, Math.min(150, prev.seiLatency + (Math.random() - 0.5) * 20)),
        blockHeight: prev.blockHeight + Math.floor(Math.random() * 3) + 1,
      }))
    }, 3000)

    // Real-time updates simulation
    const intervalLive = setInterval(() => {
      if (!isLive) return
      setLastUpdate(new Date())
    }, 5000)

    return () => {
      clearInterval(interval)
      clearInterval(intervalLive)
    }
  }, [isLive])

  const totalProfit = executions.filter((e) => e.success).reduce((sum, e) => sum + e.profit, 0)
  const successRate = executions.length > 0 ? (executions.filter((e) => e.success).length / executions.length) * 100 : 0
  const avgExecutionTime =
    executions.length > 0 ? executions.reduce((sum, e) => sum + e.executionTime, 0) / executions.length : 0

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-600/30 bg-slate-800/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bot className="h-8 w-8 text-sky-400" />
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full gentle-pulse ${
                    isAgentRunning ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
              </div>
              <div>
                <span className="text-2xl font-bold gradient-text">FlashArb.AI Dashboard</span>
                <div className="text-xs text-slate-400">Live Agent Monitoring</div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className={`${isAgentRunning ? "badge-success" : "badge-error"} px-3 py-1`}>
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    isAgentRunning ? "bg-emerald-400 gentle-pulse" : "bg-rose-400"
                  }`}
                />
                {isAgentRunning ? "Agent Active" : "Agent Stopped"}
              </Badge>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => setIsAgentRunning(!isAgentRunning)}
                  className={isAgentRunning ? "btn-danger" : "btn-success"}
                >
                  {isAgentRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isAgentRunning ? "Stop Agent" : "Start Agent"}
                </Button>

                <Button size="sm" className="btn-secondary">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button size="sm" className="btn-secondary" onClick={() => setIsLive(!isLive)}>
                  {isLive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isLive ? "Pause Live" : "Resume Live"}
                </Button>

                <Button size="sm" className="btn-secondary" onClick={() => setLastUpdate(new Date())}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total Profit</p>
                  <p className="text-3xl font-bold text-emerald-300">${totalProfit.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Success Rate</p>
                  <p className="text-3xl font-bold text-sky-300">{successRate.toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-sky-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Avg Execution</p>
                  <p className="text-3xl font-bold text-violet-300">{avgExecutionTime.toFixed(0)}ms</p>
                </div>
                <Clock className="h-8 w-8 text-violet-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Sei Latency</p>
                  <p className="text-3xl font-bold text-amber-300">{networkMetrics.seiLatency}ms</p>
                </div>
                <Zap className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 shadow-lg mb-8 p-1">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-sky-600/50 data-[state=active]:text-white rounded-lg"
            >
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="agents"
              className="data-[state=active]:bg-sky-600/50 data-[state=active]:text-white rounded-lg"
            >
              <Bot className="h-4 w-4 mr-2" />
              AI Agents
            </TabsTrigger>
            <TabsTrigger
              value="opportunities"
              className="data-[state=active]:bg-sky-600/50 data-[state=active]:text-white rounded-lg"
            >
              <Brain className="h-4 w-4 mr-2" />
              Opportunities
            </TabsTrigger>
            <TabsTrigger
              value="executions"
              className="data-[state=active]:bg-sky-600/50 data-[state=active]:text-white rounded-lg"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Executions
            </TabsTrigger>
            <TabsTrigger
              value="network"
              className="data-[state=active]:bg-sky-600/50 data-[state=active]:text-white rounded-lg"
            >
              <Network className="h-4 w-4 mr-2" />
              Network
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-200">
                    <TrendingUp className="h-5 w-5 mr-2 text-emerald-400" />
                    Profit Trend (Live)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={profitData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                      <XAxis dataKey="time" stroke="rgb(148, 163, 184)" />
                      <YAxis stroke="rgb(148, 163, 184)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(30, 41, 59, 0.9)",
                          borderColor: "rgba(148, 163, 184, 0.3)",
                          borderRadius: "0.5rem",
                          color: "rgb(226, 232, 240)",
                        }}
                      />
                      <Area type="monotone" dataKey="profit" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-200">
                    <Brain className="h-5 w-5 mr-2 text-violet-400" />
                    AI Decision Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {opportunities.slice(0, 3).map((opp) => (
                      <div key={opp.id} className="reasoning-flow">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-slate-200">{opp.tokenPair}</span>
                          <Badge
                            className={`${
                              opp.decision === "EXECUTE"
                                ? "badge-success"
                                : opp.decision === "MONITOR"
                                  ? "badge-warning"
                                  : "badge-error"
                            }`}
                          >
                            {opp.decision}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300">{opp.reasoning}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                          <span>Confidence: {(opp.confidence * 100).toFixed(1)}%</span>
                          <span>Risk: {(opp.riskScore * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents">
            <div className="grid lg:grid-cols-2 gap-8">
              {agents.map((agent) => (
                <Card key={agent.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-slate-200">
                        <div
                          className={`w-3 h-3 rounded-full mr-3 ${
                            agent.status === "Active"
                              ? "bg-emerald-400 gentle-pulse"
                              : agent.status === "Executing"
                                ? "bg-amber-400 soft-glow"
                                : agent.status === "Learning"
                                  ? "bg-sky-400 gentle-pulse"
                                  : "bg-slate-400"
                          }`}
                        />
                        {agent.id}
                      </CardTitle>
                      <Badge
                        className={`${
                          agent.status === "Active"
                            ? "badge-success"
                            : agent.status === "Executing"
                              ? "badge-warning"
                              : agent.status === "Learning"
                                ? "badge-info"
                                : "badge-neutral"
                        }`}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-sky-300">{agent.performance.toFixed(1)}%</p>
                          <p className="text-xs text-slate-400">Performance</p>
                        </div>
                        <div>
                          <p
                            className={`text-2xl font-bold ${
                              agent.profit24h >= 0 ? "text-emerald-300" : "text-rose-300"
                            }`}
                          >
                            ${agent.profit24h.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-400">24h Profit</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-violet-300">{agent.accuracy.toFixed(1)}%</p>
                          <p className="text-xs text-slate-400">Accuracy</p>
                        </div>
                      </div>

                      <div className="reasoning-flow">
                        <p className="text-sm text-slate-300">{agent.reasoning}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Decisions: {agent.decisions}</span>
                        <span>Type: {agent.type}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-200">
                  <Brain className="h-5 w-5 mr-2 text-violet-400" />
                  Live Arbitrage Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {opportunities.slice(0, 10).map((opp) => (
                    <div key={opp.id} className="reasoning-flow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-slate-200">{opp.tokenPair}</span>
                        <Badge
                          className={`${
                            opp.decision === "EXECUTE"
                              ? "badge-success"
                              : opp.decision === "MONITOR"
                                ? "badge-warning"
                                : "badge-error"
                          }`}
                        >
                          {opp.decision}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300 truncate">{opp.reasoning}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                        <span>Spread: {(opp.spread * 100).toFixed(2)}%</span>
                        <span>Profit Potential: ${opp.profitPotential.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-200">
                  <TrendingUp className="h-5 w-5 mr-2 text-emerald-400" />
                  Recent Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executions.slice(0, 10).map((exec) => (
                    <div key={exec.id} className="reasoning-flow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-slate-200">Execution ID: {exec.id}</span>
                        <Badge className={`${exec.success ? "badge-success" : "badge-error"}`}>
                          {exec.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300">
                        Profit: ${exec.profit.toFixed(2)} | Execution Time: {exec.executionTime.toFixed(0)}ms | Gas
                        Used: {exec.gasUsed.toFixed(6)} SEI
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                        <span>
                          Tx Hash:{" "}
                          <a
                            href={`https://seistream.app/tx/${exec.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-300 hover:text-sky-200 font-mono text-xs transition-colors"
                          >
                            {exec.txHash.slice(0, 10)}...
                          </a>
                        </span>
                        <span>Timestamp: {new Date(exec.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-200">
                    <Network className="h-5 w-5 mr-2 text-sky-400" />
                    Sei Network Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-300">Network Status</span>
                      <Badge
                        className={`${
                          networkMetrics.status === "healthy"
                            ? "badge-success"
                            : networkMetrics.status === "degraded"
                              ? "badge-warning"
                              : "badge-error"
                        }`}
                      >
                        {networkMetrics.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <p className="text-2xl font-bold text-sky-300">{networkMetrics.seiLatency}ms</p>
                        <p className="text-xs text-slate-400">Network Latency</p>
                      </div>
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <p className="text-2xl font-bold text-violet-300">
                          {networkMetrics.blockHeight.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">Block Height</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Gas Price</span>
                        <span className="font-mono text-sm text-slate-300">{networkMetrics.gasPrice} SEI</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Chain ID</span>
                        <span className="font-mono text-sm text-slate-300">atlantic-2</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Finality</span>
                        <span className="font-mono text-sm text-emerald-300">Sub-400ms</span>
                      </div>
                    </div>

                    <div className="border border-sky-400/30 bg-sky-500/10 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Zap className="h-4 w-4 text-sky-300 mr-2" />
                        <span className="text-sky-200 font-medium">Sei Advantage</span>
                      </div>
                      <div className="text-sky-200 text-sm">
                        Sub-400ms finality provides significant arbitrage timing advantage over other networks.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-200">
                    <Globe className="h-5 w-5 mr-2 text-emerald-400" />
                    Multi-Chain Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Sei Network", latency: networkMetrics.seiLatency, status: "healthy" },
                      { name: "Ethereum", latency: 2300, status: "degraded" },
                      { name: "BSC", latency: 800, status: "healthy" },
                      { name: "Polygon", latency: 1100, status: "healthy" },
                      { name: "Avalanche", latency: 900, status: "healthy" },
                      { name: "Arbitrum", latency: 1500, status: "healthy" },
                    ].map((network) => (
                      <div
                        key={network.name}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-3 ${
                              network.status === "healthy"
                                ? "bg-emerald-400"
                                : network.status === "degraded"
                                  ? "bg-amber-400"
                                  : "bg-rose-400"
                            }`}
                          />
                          <span className="font-medium text-slate-200">{network.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-slate-300">{network.latency}ms</p>
                          <p className="text-xs text-slate-400 capitalize">{network.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-sky-600/20 to-violet-600/20 rounded-2xl p-8 border border-sky-400/30">
            <h3 className="text-2xl font-bold mb-4 text-slate-200">🏆 Sei AI Accelathon Winner</h3>
            <p className="text-slate-300 mb-6">FlashArb.AI - The world's first truly autonomous AI arbitrage system</p>
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center text-slate-300">
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                <span>Native Sei Integration</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Brain className="h-4 w-4 mr-2 text-violet-400" />
                <span>True AI Reasoning</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Zap className="h-4 w-4 mr-2 text-amber-400" />
                <span>Sub-400ms Execution</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Shield className="h-4 w-4 mr-2 text-sky-400" />
                <span>Autonomous Operation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
<TabsList className="grid w-full grid-cols-7 bg-slate-800/50 backdrop-blur-xl border border-slate-600/30 shadow-lg mb-8 p-1">
  <TabsTrigger value="opportunities" className="data-[state=active]:bg-sky-600/50 data-[state=active]:text-white rounded-lg"><Brain className="h-4 w-4 mr-2" />Opportunities</TabsTrigger>
  <TabsTrigger value="agents" className="data-[state=active]:bg-sky-600/50 data-[state=active]:text-white rounded-lg"><Bot className="h-4 w-4 mr-2" />Agents</TabsTrigger>
  <TabsTrigger value="trades" className="data-[state=active]:bg-sky-600/50 data-[state=active]:text-white rounded-lg"><TrendingUp className="h-4 w-4 mr-2" />Trades</TabsTrigger>
  <TabsTrigger value="timeline" className="data-[state=active]:bg-sky-600/50 data-[state=active]:text-white rounded-lg"><Clock className="h-4 w-4 mr-2" />Timeline</TabsTrigger>
  <TabsTrigger value="treasury" className="data-[state=active]:bg-sky-600/50 data-[state=active]:text-white rounded-lg"><DollarSign className="h-4 w-4 mr-2" />Treasury</TabsTrigger>
  <TabsTrigger value="analytics" className="data-[state=active]:bg-sky-600/50 data-[state=active]:text-white rounded-lg"><Activity className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
  <TabsTrigger value="contracts" className="data-[state=active]:bg-sky-600/50 data-[state=active]:text-white rounded-lg"><Shield className="h-4 w-4 mr-2" />Contracts</TabsTrigger>
</TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-200">
                    <TrendingUp className="h-5 w-5 mr-2 text-emerald-400" />
                    Profit Trend (Live)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={profitData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                      <XAxis dataKey="time" stroke="rgb(148, 163, 184)" />
                      <YAxis stroke="rgb(148, 163, 184)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(30, 41, 59, 0.9)",
                          borderColor: "rgba(148, 163, 184, 0.3)",
                          borderRadius: "0.5rem",
                          color: "rgb(226, 232, 240)",
                        }}
                      />
                      <Area type="monotone" dataKey="profit" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-200">
                    <Brain className="h-5 w-5 mr-2 text-violet-400" />
                    AI Decision Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {opportunities.slice(0, 3).map((opp) => (
                      <div key={opp.id} className="reasoning-flow">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-slate-200">{opp.tokenPair}</span>
                          <Badge
                            className={`${
                              opp.decision === "EXECUTE"
                                ? "badge-success"
                                : opp.decision === "MONITOR"
                                  ? "badge-warning"
                                  : "badge-error"
                            }`}
                          >
                            {opp.decision}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-300">{opp.reasoning}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                          <span>Confidence: {(opp.confidence * 100).toFixed(1)}%</span>
                          <span>Risk: {(opp.riskScore * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Agents Tab */}
          <TabsContent value="agents">
            <div className="grid lg:grid-cols-2 gap-8">
              {agents.map((agent) => (
                <Card key={agent.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-slate-200">
                        <div
                          className={`w-3 h-3 rounded-full mr-3 ${
                            agent.status === "Active"
                              ? "bg-emerald-400 gentle-pulse"
                              : agent.status === "Executing"
                                ? "bg-amber-400 soft-glow"
                                : agent.status === "Learning"
                                  ? "bg-sky-400 gentle-pulse"
                                  : "bg-slate-400"
                          }`}
                        />
                        {agent.id}
                      </CardTitle>
                      <Badge
                        className={`${
                          agent.status === "Active"
                            ? "badge-success"
                            : agent.status === "Executing"
                              ? "badge-warning"
                              : agent.status === "Learning"
                                ? "badge-info"
                                : "badge-neutral"
                        }`}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-sky-300">{agent.performance.toFixed(1)}%</p>
                          <p className="text-xs text-slate-400">Performance</p>
                        </div>
                        <div>
                          <p
                            className={`text-2xl font-bold ${
                              agent.profit24h >= 0 ? "text-emerald-300" : "text-rose-300"
                            }`}
                          >
                            ${agent.profit24h.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-400">24h Profit</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-violet-300">{agent.accuracy.toFixed(1)}%</p>
                          <p className="text-xs text-slate-400">Accuracy</p>
                        </div>
                      </div>

                      <div className="reasoning-flow">
                        <p className="text-sm text-slate-300">{agent.reasoning}</p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Decisions: {agent.decisions}</span>
                        <span>Type: {agent.type}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-200">
                  <Brain className="h-5 w-5 mr-2 text-violet-400" />
                  Live Arbitrage Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {opportunities.slice(0, 10).map((opp) => (
                    <div key={opp.id} className="reasoning-flow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-slate-200">{opp.tokenPair}</span>
                        <Badge
                          className={`${
                            opp.decision === "EXECUTE"
                              ? "badge-success"
                              : opp.decision === "MONITOR"
                                ? "badge-warning"
                                : "badge-error"
                          }`}
                        >
                          {opp.decision}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300 truncate">{opp.reasoning}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                        <span>Spread: {(opp.spread * 100).toFixed(2)}%</span>
                        <span>Profit Potential: ${opp.profitPotential.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Executions Tab */}
          <TabsContent value="executions">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center text-slate-200">
                  <TrendingUp className="h-5 w-5 mr-2 text-emerald-400" />
                  Recent Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executions.slice(0, 10).map((exec) => (
                    <div key={exec.id} className="reasoning-flow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-slate-200">Execution ID: {exec.id}</span>
                        <Badge className={`${exec.success ? "badge-success" : "badge-error"}`}>
                          {exec.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300">
                        Profit: ${exec.profit.toFixed(2)} | Execution Time: {exec.executionTime.toFixed(0)}ms | Gas
                        Used: {exec.gasUsed.toFixed(6)} SEI
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                        <span>
                          Tx Hash:{" "}
                          <a
                            href={`https://seistream.app/tx/${exec.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-300 hover:text-sky-200 font-mono text-xs transition-colors"
                          >
                            {exec.txHash.slice(0, 10)}...
                          </a>
                        </span>
                        <span>Timestamp: {new Date(exec.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-200">
                    <Network className="h-5 w-5 mr-2 text-sky-400" />
                    Sei Network Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-300">Network Status</span>
                      <Badge
                        className={`${
                          networkMetrics.status === "healthy"
                            ? "badge-success"
                            : networkMetrics.status === "degraded"
                              ? "badge-warning"
                              : "badge-error"
                        }`}
                      >
                        {networkMetrics.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <p className="text-2xl font-bold text-sky-300">{networkMetrics.seiLatency}ms</p>
                        <p className="text-xs text-slate-400">Network Latency</p>
                      </div>
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <p className="text-2xl font-bold text-violet-300">
                          {networkMetrics.blockHeight.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-400">Block Height</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Gas Price</span>
                        <span className="font-mono text-sm text-slate-300">{networkMetrics.gasPrice} SEI</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Chain ID</span>
                        <span className="font-mono text-sm text-slate-300">atlantic-2</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Finality</span>
                        <span className="font-mono text-sm text-emerald-300">Sub-400ms</span>
                      </div>
                    </div>

                    <div className="border border-sky-400/30 bg-sky-500/10 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <Zap className="h-4 w-4 text-sky-300 mr-2" />
                        <span className="text-sky-200 font-medium">Sei Advantage</span>
                      </div>
                      <div className="text-sky-200 text-sm">
                        Sub-400ms finality provides significant arbitrage timing advantage over other networks.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center text-slate-200">
                    <Globe className="h-5 w-5 mr-2 text-emerald-400" />
                    Multi-Chain Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Sei Network", latency: networkMetrics.seiLatency, status: "healthy" },
                      { name: "Ethereum", latency: 2300, status: "degraded" },
                      { name: "BSC", latency: 800, status: "healthy" },
                      { name: "Polygon", latency: 1100, status: "healthy" },
                      { name: "Avalanche", latency: 900, status: "healthy" },
                      { name: "Arbitrum", latency: 1500, status: "healthy" },
                    ].map((network) => (
                      <div
                        key={network.name}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-3 ${
                              network.status === "healthy"
                                ? "bg-emerald-400"
                                : network.status === "degraded"
                                  ? "bg-amber-400"
                                  : "bg-rose-400"
                            }`}
                          />
                          <span className="font-medium text-slate-200">{network.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono text-slate-300">{network.latency}ms</p>
                          <p className="text-xs text-slate-400 capitalize">{network.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-sky-600/20 to-violet-600/20 rounded-2xl p-8 border border-sky-400/30">
            <h3 className="text-2xl font-bold mb-4 text-slate-200">🏆 Sei AI Accelathon Winner</h3>
            <p className="text-slate-300 mb-6">FlashArb.AI - The world's first truly autonomous AI arbitrage system</p>
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center text-slate-300">
                <CheckCircle className="h-4 w-4 mr-2 text-emerald-400" />
                <span>Native Sei Integration</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Brain className="h-4 w-4 mr-2 text-violet-400" />
                <span>True AI Reasoning</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Zap className="h-4 w-4 mr-2 text-amber-400" />
                <span>Sub-400ms Execution</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Shield className="h-4 w-4 mr-2 text-sky-400" />
                <span>Autonomous Operation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { ethers } from 'ethers';

// Add new TabsContent sections
<TabsContent value="timeline">
  <Card className="glass-card">
    <CardHeader><CardTitle>Execution Timeline</CardTitle></CardHeader>
    <CardContent>// Timeline component showing agent decisions chronologically</CardContent>
  </Card>
</TabsContent>
<TabsContent value="treasury">
  <Card className="glass-card">
    <CardHeader><CardTitle>Treasury Management</CardTitle></CardHeader>
    <CardContent>// Display Vault balances, routing to DAO_TREASURY</CardContent>
  </Card>
</TabsContent>
<TabsContent value="analytics">
  <Card className="glass-card">
    <CardHeader><CardTitle>Advanced Analytics</CardTitle></CardHeader>
    <CardContent>// Charts for performance, risk, etc.</CardContent>
  </Card>
</TabsContent>
<TabsContent value="contracts">
  <Card className="glass-card">
    <CardHeader><CardTitle>Smart Contracts</CardTitle></CardHeader>
    <CardContent>// List contracts from agents, opportunities, trades, treasury, utils</CardContent>
  </Card>
</TabsContent>

// In useEffect, update agents to include ScalperAgent, VolumeHunter, LPDrainer
setAgents([ /* updated with new types */ ]);
// Integrate live execution
if (newOpportunity.decision === "EXECUTE") {
  const provider = new ethers.providers.JsonRpcProvider('https://sei-testnet-rpc.example.com');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  // Real transaction logic
  const tx = await wallet.sendTransaction({ /* params */ });
  await tx.wait();
  // Update executions
}
