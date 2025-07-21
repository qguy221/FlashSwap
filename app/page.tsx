"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  TrendingUp,
  DollarSign,
  Zap,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react"

interface AgentDecision {
  decision: "EXECUTE" | "SKIP" | "MONITOR" | "RETRY"
  confidence: number
  reasoning: string
  tokenPair: string
  spread: number
  expectedProfit: number
  riskScore: number
  timestamp: number
}

interface Transaction {
  id: string
  hash: string
  tokenPair: string
  profit: number
  gasUsed: number
  timestamp: number
  status: "success" | "failed" | "pending"
}

interface LiveMetrics {
  totalProfit: number
  successRate: number
  activeOpportunities: number
  avgExecutionTime: number
  gasEfficiency: number
  riskScore: number
}

export default function FlashArbDashboard() {
  const [agentStatus, setAgentStatus] = useState<"ACTIVE" | "PAUSED" | "LEARNING">("ACTIVE")
  const [currentDecision, setCurrentDecision] = useState<AgentDecision | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    totalProfit: 0,
    successRate: 0,
    activeOpportunities: 0,
    avgExecutionTime: 0,
    gasEfficiency: 0,
    riskScore: 0,
  })
  const [agentLogs, setAgentLogs] = useState<string[]>([])

  // Simulate real-time agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate agent decision making
      const mockDecision: AgentDecision = {
        decision: Math.random() > 0.7 ? "EXECUTE" : Math.random() > 0.5 ? "MONITOR" : "SKIP",
        confidence: Math.floor(Math.random() * 40) + 60,
        reasoning: getRandomReasoning(),
        tokenPair: getRandomTokenPair(),
        spread: Math.random() * 300 + 50,
        expectedProfit: Math.random() * 500 + 100,
        riskScore: Math.floor(Math.random() * 60) + 20,
        timestamp: Date.now(),
      }

      setCurrentDecision(mockDecision)

      // Add to logs
      const logEntry = `[${new Date().toLocaleTimeString()}] ${mockDecision.decision}: ${mockDecision.tokenPair} - ${mockDecision.reasoning}`
      setAgentLogs((prev) => [logEntry, ...prev.slice(0, 9)])

      // If decision is EXECUTE, simulate transaction
      if (mockDecision.decision === "EXECUTE") {
        const mockTx: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          hash: "0x" + Math.random().toString(16).substr(2, 64),
          tokenPair: mockDecision.tokenPair,
          profit: mockDecision.expectedProfit * (0.8 + Math.random() * 0.4),
          gasUsed: Math.floor(Math.random() * 200000) + 100000,
          timestamp: Date.now(),
          status: Math.random() > 0.1 ? "success" : "failed",
        }

        setRecentTransactions((prev) => [mockTx, ...prev.slice(0, 9)])

        // Update metrics
        setLiveMetrics((prev) => ({
          ...prev,
          totalProfit: prev.totalProfit + (mockTx.status === "success" ? mockTx.profit : 0),
          successRate: Math.min(95, prev.successRate + (Math.random() - 0.3)),
          activeOpportunities: Math.floor(Math.random() * 15) + 5,
          avgExecutionTime: 380 + Math.random() * 40,
          gasEfficiency: 85 + Math.random() * 10,
          riskScore: Math.floor(Math.random() * 30) + 20,
        }))
      }
    }, 8000) // 8-second cycles

    return () => clearInterval(interval)
  }, [])

  const getRandomReasoning = () => {
    const reasons = [
      "High spread detected, low network congestion",
      "Optimal liquidity conditions, executing immediately",
      "Market volatility too high, monitoring for stability",
      "Gas prices elevated, waiting for better conditions",
      "Strong historical performance on this pair",
      "Risk-reward ratio favorable, proceeding with execution",
      "Insufficient liquidity depth, skipping opportunity",
      "Network congestion detected, delaying execution",
    ]
    return reasons[Math.floor(Math.random() * reasons.length)]
  }

  const getRandomTokenPair = () => {
    const pairs = ["SEI/USDC", "SEI/USDT", "ATOM/SEI", "OSMO/SEI", "WETH/SEI", "WBTC/USDC"]
    return pairs[Math.floor(Math.random() * pairs.length)]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500"
      case "PAUSED":
        return "bg-yellow-500"
      case "LEARNING":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case "EXECUTE":
        return "bg-green-500"
      case "MONITOR":
        return "bg-yellow-500"
      case "SKIP":
        return "bg-red-500"
      case "RETRY":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FlashArb.AI
              </h1>
              <p className="text-slate-400 mt-2">Autonomous Capital Agent • Sei AI Accelathon 2024</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(agentStatus)} animate-pulse`}></div>
                <span className="text-sm font-medium">{agentStatus}</span>
              </div>
              <Badge variant="outline" className="border-purple-400 text-purple-400">
                <Zap className="w-4 h-4 mr-1" />
                Sub-400ms Execution
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="live-agent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
            <TabsTrigger value="live-agent" className="data-[state=active]:bg-purple-600">
              <Brain className="w-4 h-4 mr-2" />
              Live Agent
            </TabsTrigger>
            <TabsTrigger value="scan" className="data-[state=active]:bg-purple-600">
              <Activity className="w-4 h-4 mr-2" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="execute" className="data-[state=active]:bg-purple-600">
              <Target className="w-4 h-4 mr-2" />
              Execute
            </TabsTrigger>
            <TabsTrigger value="treasury" className="data-[state=active]:bg-purple-600">
              <DollarSign className="w-4 h-4 mr-2" />
              Treasury
            </TabsTrigger>
            <TabsTrigger value="contracts" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Contracts
            </TabsTrigger>
          </TabsList>

          {/* Live Agent Tab */}
          <TabsContent value="live-agent" className="space-y-6">
            {/* Real-time Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Profit</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">${liveMetrics.totalProfit.toFixed(2)}</div>
                  <p className="text-xs text-slate-500 mt-1">+12.5% from last hour</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{liveMetrics.successRate.toFixed(1)}%</div>
                  <Progress value={liveMetrics.successRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Active Opportunities</CardTitle>
                  <Activity className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-400">{liveMetrics.activeOpportunities}</div>
                  <p className="text-xs text-slate-500 mt-1">Across 6 DEX pairs</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Avg Execution</CardTitle>
                  <Clock className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-400">{liveMetrics.avgExecutionTime.toFixed(0)}ms</div>
                  <p className="text-xs text-slate-500 mt-1">Sub-400ms target</p>
                </CardContent>
              </Card>
            </div>

            {/* Current Decision & Agent Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-400" />
                    Current AI Decision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {currentDecision ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Decision:</span>
                        <Badge className={`${getDecisionColor(currentDecision.decision)} text-white`}>
                          {currentDecision.decision}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Token Pair:</span>
                        <span className="font-mono">{currentDecision.tokenPair}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Confidence:</span>
                        <span className="text-green-400">{currentDecision.confidence}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Spread:</span>
                        <span className="text-yellow-400">{currentDecision.spread.toFixed(2)} bps</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Expected Profit:</span>
                        <span className="text-green-400">${currentDecision.expectedProfit.toFixed(2)}</span>
                      </div>
                      <div className="mt-4 p-3 bg-slate-700 rounded-lg">
                        <p className="text-sm text-slate-300">{currentDecision.reasoning}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 py-8">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Agent is analyzing market conditions...</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-400" />
                    Agent Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {agentLogs.map((log, index) => (
                      <div key={index} className="text-sm font-mono text-slate-300 p-2 bg-slate-700 rounded">
                        {log}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {tx.status === "success" ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                          <p className="font-mono text-sm">{tx.tokenPair}</p>
                          <p className="text-xs text-slate-500">{tx.hash.slice(0, 10)}...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.status === "success" ? "text-green-400" : "text-red-400"}`}>
                          {tx.status === "success" ? "+" : "-"}${Math.abs(tx.profit).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500">{tx.gasUsed.toLocaleString()} gas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scan Tab */}
          <TabsContent value="scan" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Pool Scanner Smart Contract</CardTitle>
                <CardDescription>Real-time DEX pool monitoring and opportunity detection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Activity className="w-4 h-4 mr-2" />
                    Scan Pools
                  </Button>
                  <Button variant="outline" className="border-slate-600 bg-transparent">
                    Update Feeds
                  </Button>
                  <Button variant="outline" className="border-slate-600 bg-transparent">
                    View Opportunities
                  </Button>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Contract Address</h4>
                  <p className="font-mono text-sm text-slate-300">0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Active Pools</h4>
                    <p className="text-2xl font-bold text-blue-400">24</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Scan Frequency</h4>
                    <p className="text-2xl font-bold text-green-400">2s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Execute Tab */}
          <TabsContent value="execute" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Arbitrage Executor Smart Contract</CardTitle>
                <CardDescription>Autonomous execution engine with flash loan capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Target className="w-4 h-4 mr-2" />
                    Execute Trade
                  </Button>
                  <Button variant="outline" className="border-slate-600 bg-transparent">
                    Flash Loan
                  </Button>
                  <Button variant="outline" className="border-slate-600 bg-transparent">
                    Emergency Stop
                  </Button>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Contract Address</h4>
                  <p className="font-mono text-sm text-slate-300">0x123d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Executions</h4>
                    <p className="text-2xl font-bold text-green-400">1,247</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Success Rate</h4>
                    <p className="text-2xl font-bold text-blue-400">94.2%</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Avg Gas</h4>
                    <p className="text-2xl font-bold text-yellow-400">180k</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treasury Tab */}
          <TabsContent value="treasury" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Treasury Vault Smart Contract</CardTitle>
                <CardDescription>Secure profit management and yield optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Deposit Funds
                  </Button>
                  <Button variant="outline" className="border-slate-600 bg-transparent">
                    Withdraw
                  </Button>
                  <Button variant="outline" className="border-slate-600 bg-transparent">
                    Rebalance
                  </Button>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Contract Address</h4>
                  <p className="font-mono text-sm text-slate-300">0x456d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Total Value Locked</h4>
                    <p className="text-2xl font-bold text-green-400">$2,847,392</p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">APY</h4>
                    <p className="text-2xl font-bold text-purple-400">24.7%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Deployed Contracts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                    <span>PoolScanner</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                    <span>ArbExecutor</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                    <span>DecisionEngine</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700 rounded">
                    <span>TreasuryVault</span>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Network Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Network:</span>
                    <span>Sei Testnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Block Height:</span>
                    <span>2,847,392</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gas Price:</span>
                    <span>0.1 usei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Finality:</span>
                    <span className="text-green-400">380ms</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
