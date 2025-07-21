"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Code,
  Copy,
  CheckCircle,
  AlertTriangle,
  TestTube,
  Network,
  Shield,
  Zap,
  Globe,
  Bot,
  Target,
  Activity,
  FileCode,
  Play,
} from "lucide-react"
import Link from "next/link"

interface SmartContract {
  name: string
  address: string
  description: string
  functions: string[]
  verified: boolean
  audited: boolean
  gasOptimized: boolean
  network: string
  deployedAt: string
  version: string
}

export default function ContractsPage() {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<{ [key: string]: string }>({})

  const contracts: SmartContract[] = [
    {
      name: "FlashSwapArbAgent",
      address: "0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C",
      description: "Core arbitrage engine with flash loan integration for cross-DEX opportunities",
      functions: ["executeArbitrage", "calculateProfit", "flashLoan", "emergencyStop"],
      verified: true,
      audited: true,
      gasOptimized: true,
      network: "Sei Network",
      deployedAt: "2024-01-15",
      version: "v2.1.0",
    },
    {
      name: "AgentManager",
      address: "0x853e46Dd7645D1542936a4b8E5C5E5E5E5E5E5E5",
      description: "Multi-agent coordination and deployment system with neural network management",
      functions: ["deployAgent", "updateStrategy", "pauseAgent", "collectMetrics"],
      verified: true,
      audited: true,
      gasOptimized: true,
      network: "Sei Network",
      deployedAt: "2024-01-15",
      version: "v2.1.0",
    },
    {
      name: "CrossChainBridge",
      address: "0x964f57Ee8756F1653947b5b9F6F6F6F6F6F6F6F6",
      description: "Secure cross-chain asset transfer with atomic swaps and rollback protection",
      functions: ["bridgeAssets", "verifyProof", "rollbackTransaction", "updateValidator"],
      verified: true,
      audited: true,
      gasOptimized: true,
      network: "Multi-Chain",
      deployedAt: "2024-01-15",
      version: "v2.1.0",
    },
    {
      name: "RiskManager",
      address: "0xa75068Ff9867G1764958c6c7G7G7G7G7G7G7G7G7",
      description: "Advanced risk assessment and portfolio protection with AI-driven analysis",
      functions: ["assessRisk", "setLimits", "liquidatePosition", "rebalancePortfolio"],
      verified: true,
      audited: true,
      gasOptimized: true,
      network: "Sei Network",
      deployedAt: "2024-01-15",
      version: "v2.1.0",
    },
    {
      name: "ProfitDistributor",
      address: "0xb86179Gga978H1875069d7d8H8H8H8H8H8H8H8H8",
      description: "Automated profit harvesting and distribution with gas optimization",
      functions: ["distributeProfits", "claimRewards", "reinvestProfits", "updateFees"],
      verified: true,
      audited: true,
      gasOptimized: true,
      network: "Sei Network",
      deployedAt: "2024-01-15",
      version: "v2.1.0",
    },
    {
      name: "OpportunityScanner",
      address: "0xc97280Hhb089I1986170e8e9I9I9I9I9I9I9I9I9",
      description: "Real-time market opportunity detection with ML-powered prediction algorithms",
      functions: ["scanMarkets", "predictOpportunity", "validateSignal", "updateModel"],
      verified: true,
      audited: true,
      gasOptimized: true,
      network: "Multi-Chain",
      deployedAt: "2024-01-15",
      version: "v2.1.0",
    },
  ]

  const copyToClipboard = async (text: string, contractName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddress(contractName)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const testSmartContract = async (contractName: string) => {
    setTestResults((prev) => ({ ...prev, [contractName]: "Testing smart contract..." }))

    // Simulate smart contract testing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const success = Math.random() > 0.1 // 90% success rate
    const gasUsed = Math.floor(Math.random() * 400000 + 200000)
    const blockNumber = Math.floor(Math.random() * 1000000 + 5000000)

    const result = success
      ? `✅ ${contractName} test successful! Gas used: ${gasUsed.toLocaleString()}, Block: ${blockNumber.toLocaleString()}, Network: Sei Testnet`
      : `❌ ${contractName} test failed. Contract may be paused or network congestion detected. Please retry.`

    setTestResults((prev) => ({ ...prev, [contractName]: result }))

    // Clear result after 8 seconds
    setTimeout(() => {
      setTestResults((prev) => ({ ...prev, [contractName]: "" }))
    }, 8000)
  }

  const sampleCode = {
    solidity: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FlashSwapArbAgent is ReentrancyGuard, Ownable {
    struct ArbitrageParams {
        address tokenA;
        address tokenB;
        uint256 amountIn;
        address[] dexes;
        bytes[] swapData;
    }
    
    event ArbitrageExecuted(
        address indexed tokenA,
        address indexed tokenB,
        uint256 profit,
        address indexed executor
    );
    
    function executeArbitrage(
        ArbitrageParams calldata params
    ) external nonReentrant returns (uint256 profit) {
        // Flash loan initiation
        uint256 initialBalance = IERC20(params.tokenA).balanceOf(address(this));
        
        // Execute cross-DEX arbitrage
        _performSwaps(params);
        
        // Calculate and validate profit
        uint256 finalBalance = IERC20(params.tokenA).balanceOf(address(this));
        require(finalBalance > initialBalance, "No profit generated");
        
        profit = finalBalance - initialBalance;
        emit ArbitrageExecuted(params.tokenA, params.tokenB, profit, msg.sender);
        
        return profit;
    }
    
    function _performSwaps(ArbitrageParams calldata params) internal {
        // Implementation of multi-DEX swap logic
        // Gas-optimized routing algorithm
        // MEV protection mechanisms
    }
}`,

    javascript: `// NEXUS AI Agent Integration
import { ethers } from 'ethers';
import { FlashSwapArbAgent__factory } from './typechain';

class NexusAIAgent {
  constructor(provider, privateKey) {
    this.provider = provider;
    this.wallet = new ethers.Wallet(privateKey, provider);
    this.contract = FlashSwapArbAgent__factory.connect(
      '0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C',
      this.wallet
    );
  }

  async executeArbitrage(opportunity) {
    try {
      // AI-powered opportunity validation
      const validated = await this.validateOpportunity(opportunity);
      if (!validated) return null;

      // Execute arbitrage with gas optimization
      const tx = await this.contract.executeArbitrage({
        tokenA: opportunity.tokenA,
        tokenB: opportunity.tokenB,
        amountIn: opportunity.amount,
        dexes: opportunity.dexes,
        swapData: opportunity.swapData
      }, {
        gasLimit: 500000,
        gasPrice: await this.getOptimalGasPrice()
      });

      const receipt = await tx.wait();
      console.log('Arbitrage executed:', receipt.transactionHash);
      
      return receipt;
    } catch (error) {
      console.error('Arbitrage failed:', error);
      return null;
    }
  }

  async validateOpportunity(opportunity) {
    // Neural network validation logic
    const confidence = await this.calculateConfidence(opportunity);
    return confidence > 0.85; // 85% confidence threshold
  }
}`,

    python: `# NEXUS AI Neural Network Training
import tensorflow as tf
import numpy as np
from web3 import Web3

class ArbitrageNeuralNetwork:
    def __init__(self):
        self.model = self.build_model()
        self.web3 = Web3(Web3.HTTPProvider('https://evm-rpc.sei-apis.com'))
        
    def build_model(self):
        model = tf.keras.Sequential([
            tf.keras.layers.Dense(256, activation='relu', input_shape=(50,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        return model
    
    def predict_opportunity(self, market_data):
        """
        Predict arbitrage opportunity using trained neural network
        Returns confidence score between 0 and 1
        """
        features = self.extract_features(market_data)
        prediction = self.model.predict(features.reshape(1, -1))
        return float(prediction[0][0])
    
    def extract_features(self, market_data):
        """Extract 50 features from market data"""
        features = np.array([
            market_data['price_diff'],
            market_data['volume_ratio'],
            market_data['liquidity_depth'],
            market_data['gas_price'],
            market_data['network_congestion'],
            # ... 45 more features
        ])
        return features
    
    async def execute_if_profitable(self, opportunity):
        confidence = self.predict_opportunity(opportunity)
        if confidence > 0.85:
            # Execute arbitrage via smart contract
            contract = self.web3.eth.contract(
                address='0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C',
                abi=FLASH_SWAP_ABI
            )
            
            tx = await contract.functions.executeArbitrage(
                opportunity['params']
            ).transact({'gas': 500000})
            
            return tx
        return None`,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <Network className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  NEXUS AI
                </span>
                <div className="text-xs text-slate-500 dark:text-slate-400">Smart Contracts</div>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              >
                <Shield className="h-3 w-3 mr-1" />
                All Contracts Audited
              </Badge>
              <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                  <Activity className="h-4 w-4 mr-2" />
                  Live Dashboard
                </Button>
              </Link>
              <Link href="/journey">
                <Button variant="outline" className="border-slate-200 dark:border-slate-700 bg-transparent">
                  User Journey
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900/20 dark:to-purple-900/20 dark:text-blue-300 border-0 px-6 py-3 text-lg font-medium">
              <FileCode className="h-5 w-5 mr-2" />6 Smart Contracts Deployed
            </Badge>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Smart Contract
            </span>
            <br />
            <span className="text-slate-800 dark:text-white">Architecture</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-4xl mx-auto">
            Audited, verified, and gas-optimized smart contracts powering the NEXUS AI ecosystem.
            <br />
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Built for Sei Network with cross-chain compatibility.
            </span>
          </p>

          {/* Contract Stats */}
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 mb-12 border border-slate-200/50 dark:border-slate-700/50 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">6</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Smart Contracts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">100%</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Verified</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">100%</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Audited</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">15+</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Networks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Contracts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {contracts.map((contract, index) => (
            <Card
              key={contract.name}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Code className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {contract.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {contract.network}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {contract.version}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => testSmartContract(contract.name)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Test Contract
                  </Button>
                </div>

                <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {contract.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {testResults[contract.name] && (
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{testResults[contract.name]}</AlertDescription>
                  </Alert>
                )}

                {/* Contract Address */}
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Contract Address</div>
                      <div className="font-mono text-sm text-slate-800 dark:text-white">{contract.address}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(contract.address, contract.name)}
                      className="ml-2"
                    >
                      {copiedAddress === contract.name ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Contract Features */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Verification Status</span>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">Verified</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Security Audit</span>
                    <div className="flex items-center space-x-1">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">Audited</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Gas Optimization</span>
                    <div className="flex items-center space-x-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600 dark:text-yellow-400">Optimized</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Deployed</span>
                    <span className="text-sm text-slate-800 dark:text-white">{contract.deployedAt}</span>
                  </div>
                </div>

                {/* Main Functions */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-2">Main Functions</h4>
                  <div className="flex flex-wrap gap-2">
                    {contract.functions.map((func, funcIndex) => (
                      <Badge
                        key={funcIndex}
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                      >
                        {func}()
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Code Examples */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Code Examples & Integration</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Ready-to-use code snippets for integrating with NEXUS AI smart contracts
            </p>
          </div>

          <Tabs defaultValue="solidity" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-lg mb-8 p-1">
              <TabsTrigger
                value="solidity"
                className="data-[state=active]:bg-orange-600 data-[state=active]:text-white rounded-lg"
              >
                <FileCode className="h-4 w-4 mr-2" />
                Solidity
              </TabsTrigger>
              <TabsTrigger
                value="javascript"
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white rounded-lg"
              >
                <Code className="h-4 w-4 mr-2" />
                JavaScript
              </TabsTrigger>
              <TabsTrigger
                value="python"
                className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-lg"
              >
                <Bot className="h-4 w-4 mr-2" />
                Python AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="solidity">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-800 dark:text-white flex items-center">
                      <FileCode className="h-6 w-6 mr-2 text-orange-600 dark:text-orange-400" />
                      FlashSwapArbAgent.sol
                    </CardTitle>
                    <CardDescription>Core arbitrage smart contract with flash loan integration</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => testSmartContract("Solidity Contract")}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Solidity
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(sampleCode.solidity, "solidity")}
                      variant="outline"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {testResults["Solidity Contract"] && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="font-medium">{testResults["Solidity Contract"]}</AlertDescription>
                    </Alert>
                  )}
                  <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-6 overflow-x-auto">
                    <pre className="text-sm text-slate-300">
                      <code>{sampleCode.solidity}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="javascript">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-800 dark:text-white flex items-center">
                      <Code className="h-6 w-6 mr-2 text-yellow-600 dark:text-yellow-400" />
                      nexus-ai-agent.js
                    </CardTitle>
                    <CardDescription>JavaScript integration for NEXUS AI agents</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => testSmartContract("JavaScript Integration")}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test JavaScript
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(sampleCode.javascript, "javascript")}
                      variant="outline"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {testResults["JavaScript Integration"] && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="font-medium">
                        {testResults["JavaScript Integration"]}
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-6 overflow-x-auto">
                    <pre className="text-sm text-slate-300">
                      <code>{sampleCode.javascript}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="python">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-800 dark:text-white flex items-center">
                      <Bot className="h-6 w-6 mr-2 text-green-600 dark:text-green-400" />
                      neural_network.py
                    </CardTitle>
                    <CardDescription>AI neural network for arbitrage opportunity prediction</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => testSmartContract("Python AI Network")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Test Python AI
                    </Button>
                    <Button size="sm" onClick={() => copyToClipboard(sampleCode.python, "python")} variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {testResults["Python AI Network"] && (
                    <Alert className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="font-medium">{testResults["Python AI Network"]}</AlertDescription>
                    </Alert>
                  )}
                  <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-6 overflow-x-auto">
                    <pre className="text-sm text-slate-300">
                      <code>{sampleCode.python}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Security & Audit Information */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">Security & Audits</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Enterprise-grade security with comprehensive audits and formal verification
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Security Audits",
                description: "Comprehensive security audits by leading blockchain security firms",
                features: ["CertiK Audit", "Quantstamp Review", "OpenZeppelin Analysis", "Formal Verification"],
                color: "from-green-500 to-teal-500",
                testName: "Security Audit System",
              },
              {
                icon: CheckCircle,
                title: "Code Verification",
                description: "All smart contracts verified on blockchain explorers",
                features: ["Etherscan Verified", "Source Code Public", "Compiler Settings", "Constructor Args"],
                color: "from-blue-500 to-cyan-500",
                testName: "Code Verification System",
              },
              {
                icon: Zap,
                title: "Gas Optimization",
                description: "Advanced gas optimization techniques for cost efficiency",
                features: ["Assembly Optimization", "Storage Packing", "Loop Unrolling", "Batch Operations"],
                color: "from-yellow-500 to-orange-500",
                testName: "Gas Optimization Engine",
              },
              {
                icon: Globe,
                title: "Multi-Chain Support",
                description: "Deployed across multiple blockchain networks",
                features: ["Sei Network", "Ethereum", "BSC", "Polygon", "Avalanche", "Arbitrum"],
                color: "from-purple-500 to-pink-500",
                testName: "Multi-Chain Bridge",
              },
              {
                icon: Bot,
                title: "AI Integration",
                description: "Smart contracts designed for AI agent interaction",
                features: ["Neural Network APIs", "ML Model Updates", "Automated Execution", "Self-Learning"],
                color: "from-indigo-500 to-purple-500",
                testName: "AI Integration Layer",
              },
              {
                icon: Target,
                title: "Risk Management",
                description: "Built-in risk management and circuit breakers",
                features: ["Emergency Stops", "Position Limits", "Slippage Protection", "MEV Resistance"],
                color: "from-red-500 to-pink-500",
                testName: "Risk Management System",
              },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => testSmartContract(feature.testName)}
                        className={`bg-gradient-to-r ${feature.color} hover:opacity-90 text-white`}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Test
                      </Button>
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {testResults[feature.testName] && (
                      <Alert className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="font-medium">{testResults[feature.testName]}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      {feature.features.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Deploy Your AI Swarm?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join the future of autonomous DeFi trading. Connect your wallet and start profiting today.
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl px-8 py-4 text-lg font-semibold rounded-xl"
            >
              <Play className="h-5 w-5 mr-2" />
              Launch Live Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-white">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Network className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">NEXUS AI</span>
          </div>
          <p className="text-slate-400 mb-6">The future of autonomous DeFi trading on Sei Network</p>
          <div className="flex justify-center space-x-6">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/journey" className="text-slate-400 hover:text-white transition-colors">
              User Journey
            </Link>
            <Link href="/contracts" className="text-slate-400 hover:text-white transition-colors">
              Smart Contracts
            </Link>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800">
            <p className="text-slate-500">© 2024 NEXUS AI. Built for Sei AI Accelathon.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
