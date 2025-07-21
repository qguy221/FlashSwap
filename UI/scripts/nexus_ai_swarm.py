import asyncio
import json
import time
import random
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import threading
import websocket
import requests

# --- Advanced AI Agent Classes ---

class AgentType(Enum):
    ALPHA = "Alpha"    # Market Prediction & Analysis
    BETA = "Beta"      # Cross-Chain Arbitrage
    GAMMA = "Gamma"    # MEV Extraction & Protection
    DELTA = "Delta"    # Risk Management & Optimization

class AgentStatus(Enum):
    ACTIVE = "Active"
    LEARNING = "Learning"
    EXECUTING = "Executing"
    IDLE = "Idle"
    ERROR = "Error"

@dataclass
class MarketData:
    timestamp: float
    prices: Dict[str, Dict[str, float]]  # token -> exchange -> price
    volumes: Dict[str, Dict[str, float]]
    liquidity: Dict[str, float]
    gas_prices: Dict[str, float]  # network -> gas_price
    volatility: Dict[str, float]

@dataclass
class OpportunitySignal:
    id: str
    type: str
    confidence: float
    expected_profit: float
    risk_score: float
    execution_time: float
    networks: List[str]
    tokens: List[str]
    strategy: str
    metadata: Dict
    agent_id: Optional[str] = None

@dataclass
class ExecutionResult:
    opportunity_id: str
    success: bool
    actual_profit: float
    gas_cost: float
    execution_time: float
    slippage: float
    error_message: Optional[str] = None

class NeuralNetwork:
    """Simplified neural network for agent decision making"""
    
    def __init__(self, input_size: int, hidden_size: int, output_size: int):
        self.weights1 = np.random.randn(input_size, hidden_size) * 0.1
        self.weights2 = np.random.randn(hidden_size, output_size) * 0.1
        self.bias1 = np.zeros((1, hidden_size))
        self.bias2 = np.zeros((1, output_size))
        self.learning_rate = 0.001
    
    def sigmoid(self, x):
        return 1 / (1 + np.exp(-np.clip(x, -500, 500)))
    
    def forward(self, X):
        self.z1 = np.dot(X, self.weights1) + self.bias1
        self.a1 = self.sigmoid(self.z1)
        self.z2 = np.dot(self.a1, self.weights2) + self.bias2
        self.a2 = self.sigmoid(self.z2)
        return self.a2
    
    def train(self, X, y, reward):
        # Simplified reinforcement learning update
        output = self.forward(X)
        error = y - output
        
        # Update weights based on reward
        self.weights2 += self.learning_rate * reward * np.dot(self.a1.T, error)
        self.weights1 += self.learning_rate * reward * np.dot(X.T, np.dot(error, self.weights2.T) * self.a1 * (1 - self.a1))

class AIAgent:
    """Base class for all AI agents in the NEXUS swarm"""
    
    def __init__(self, agent_id: str, agent_type: AgentType, specialization: str):
        self.id = agent_id
        self.type = agent_type
        self.specialization = specialization
        self.status = AgentStatus.IDLE
        self.neural_network = NeuralNetwork(20, 50, 10)  # Input features, hidden, output actions
        
        # Performance metrics
        self.total_trades = 0
        self.successful_trades = 0
        self.total_profit = 0.0
        self.accuracy = 95.0
        self.performance_score = 85.0
        self.learning_rate = 0.001
        
        # Memory and learning
        self.memory = []
        self.experience_buffer = []
        self.strategy_weights = np.random.rand(10)
        
        # Real-time data
        self.last_update = time.time()
        self.active_opportunities = []
        
    async def analyze_market(self, market_data: MarketData) -> List[OpportunitySignal]:
        """Analyze market data and identify opportunities"""
        opportunities = []
        
        if self.type == AgentType.ALPHA:
            opportunities = await self._alpha_analysis(market_data)
        elif self.type == AgentType.BETA:
            opportunities = await self._beta_analysis(market_data)
        elif self.type == AgentType.GAMMA:
            opportunities = await self._gamma_analysis(market_data)
        elif self.type == AgentType.DELTA:
            opportunities = await self._delta_analysis(market_data)
        
        return opportunities
    
    async def _alpha_analysis(self, market_data: MarketData) -> List[OpportunitySignal]:
        """Alpha agents focus on market prediction and trend analysis"""
        opportunities = []
        
        # Simulate advanced market analysis
        for token in market_data.prices:
            if len(market_data.prices[token]) >= 2:
                exchanges = list(market_data.prices[token].keys())
                price_variance = np.var(list(market_data.prices[token].values()))
                
                if price_variance > 0.001:  # Significant price difference
                    confidence = min(0.95, price_variance * 1000)
                    expected_profit = price_variance * 10000 * random.uniform(0.8, 1.2)
                    
                    opportunity = OpportunitySignal(
                        id=f"ALPHA-{self.id}-{int(time.time())}-{random.randint(1000, 9999)}",
                        type="Market_Prediction",
                        confidence=confidence,
                        expected_profit=expected_profit,
                        risk_score=1.0 - confidence,
                        execution_time=random.uniform(0.1, 0.3),
                        networks=["Sei", "Ethereum"],
                        tokens=[token],
                        strategy=f"Trend_Analysis_{self.specialization}",
                        metadata={
                            "price_variance": price_variance,
                            "volatility": market_data.volatility.get(token, 0.1),
                            "prediction_horizon": "5min"
                        }
                    )
                    opportunities.append(opportunity)
        
        return opportunities
    
    async def _beta_analysis(self, market_data: MarketData) -> List[OpportunitySignal]:
        """Beta agents focus on cross-chain arbitrage"""
        opportunities = []
        
        # Simulate cross-chain arbitrage detection
        for token in market_data.prices:
            exchanges = list(market_data.prices[token].keys())
            if len(exchanges) >= 2:
                prices = [market_data.prices[token][ex] for ex in exchanges]
                max_price = max(prices)
                min_price = min(prices)
                spread = (max_price - min_price) / min_price
                
                if spread > 0.005:  # 0.5% minimum spread
                    confidence = min(0.98, spread * 100)
                    expected_profit = spread * 50000 * random.uniform(0.9, 1.1)
                    
                    opportunity = OpportunitySignal(
                        id=f"BETA-{self.id}-{int(time.time())}-{random.randint(1000, 9999)}",
                        type="Cross_Chain_Arbitrage",
                        confidence=confidence,
                        expected_profit=expected_profit,
                        risk_score=0.1 + spread * 2,
                        execution_time=random.uniform(0.08, 0.15),
                        networks=exchanges[:2],
                        tokens=[token],
                        strategy=f"Arbitrage_{self.specialization}",
                        metadata={
                            "spread": spread,
                            "buy_exchange": exchanges[prices.index(min_price)],
                            "sell_exchange": exchanges[prices.index(max_price)],
                            "liquidity_check": True
                        }
                    )
                    opportunities.append(opportunity)
        
        return opportunities
    
    async def _gamma_analysis(self, market_data: MarketData) -> List[OpportunitySignal]:
        """Gamma agents focus on MEV extraction and protection"""
        opportunities = []
        
        # Simulate MEV opportunity detection
        if random.random() < 0.3:  # 30% chance of MEV opportunity
            mev_types = ["Sandwich", "Arbitrage", "Liquidation", "Front_Run_Protection"]
            mev_type = random.choice(mev_types)
            
            confidence = random.uniform(0.85, 0.95)
            expected_profit = random.uniform(1000, 10000)
            
            opportunity = OpportunitySignal(
                id=f"GAMMA-{self.id}-{int(time.time())}-{random.randint(1000, 9999)}",
                type="MEV_Extraction",
                confidence=confidence,
                expected_profit=expected_profit,
                risk_score=random.uniform(0.1, 0.3),
                execution_time=random.uniform(0.05, 0.12),
                networks=["Sei", "Ethereum"],
                tokens=random.sample(list(market_data.prices.keys()), 2),
                strategy=f"MEV_{mev_type}_{self.specialization}",
                metadata={
                    "mev_type": mev_type,
                    "gas_optimization": True,
                    "front_run_protection": True
                }
            )
            opportunities.append(opportunity)
        
        return opportunities
    
    async def _delta_analysis(self, market_data: MarketData) -> List[OpportunitySignal]:
        """Delta agents focus on risk management and portfolio optimization"""
        opportunities = []
        
        # Simulate risk management signals
        total_exposure = sum(market_data.volumes.get(token, {}).get("total", 0) for token in market_data.volumes)
        
        if total_exposure > 1000000:  # High exposure threshold
            confidence = 0.9
            expected_profit = total_exposure * 0.001  # 0.1% optimization gain
            
            opportunity = OpportunitySignal(
                id=f"DELTA-{self.id}-{int(time.time())}-{random.randint(1000, 9999)}",
                type="Risk_Management",
                confidence=confidence,
                expected_profit=expected_profit,
                risk_score=0.05,  # Low risk for risk management
                execution_time=random.uniform(0.2, 0.5),
                networks=["Sei"],
                tokens=list(market_data.prices.keys()),
                strategy=f"Portfolio_Optimization_{self.specialization}",
                metadata={
                    "total_exposure": total_exposure,
                    "rebalance_needed": True,
                    "hedge_ratio": random.uniform(0.1, 0.3)
                }
            )
            opportunities.append(opportunity)
        
        return opportunities
    
    async def execute_opportunity(self, opportunity: OpportunitySignal) -> ExecutionResult:
        """Execute an identified opportunity"""
        self.status = AgentStatus.EXECUTING
        
        # Simulate execution time
        await asyncio.sleep(opportunity.execution_time)
        
        # Simulate execution success/failure
        success_probability = opportunity.confidence * (1 - opportunity.risk_score)
        success = random.random() < success_probability
        
        if success:
            # Successful execution
            actual_profit = opportunity.expected_profit * random.uniform(0.8, 1.2)
            slippage = random.uniform(0.001, 0.01)
            gas_cost = random.uniform(10, 100)
            
            self.total_trades += 1
            self.successful_trades += 1
            self.total_profit += actual_profit
            self.accuracy = (self.successful_trades / self.total_trades) * 100
            self.performance_score = min(100, self.performance_score + 0.1)
            
            result = ExecutionResult(
                opportunity_id=opportunity.id,
                success=True,
                actual_profit=actual_profit,
                gas_cost=gas_cost,
                execution_time=opportunity.execution_time,
                slippage=slippage
            )
        else:
            # Failed execution
            self.total_trades += 1
            self.accuracy = (self.successful_trades / self.total_trades) * 100
            self.performance_score = max(0, self.performance_score - 0.2)
            
            result = ExecutionResult(
                opportunity_id=opportunity.id,
                success=False,
                actual_profit=0,
                gas_cost=random.uniform(5, 50),
                execution_time=opportunity.execution_time,
                slippage=0,
                error_message="Execution failed due to market conditions"
            )
        
        self.status = AgentStatus.ACTIVE
        return result
    
    def learn_from_result(self, opportunity: OpportunitySignal, result: ExecutionResult):
        """Learn from execution results using reinforcement learning"""
        # Prepare training data
        features = np.array([[
            opportunity.confidence,
            opportunity.expected_profit / 10000,  # Normalize
            opportunity.risk_score,
            opportunity.execution_time,
            len(opportunity.networks),
            len(opportunity.tokens),
            self.performance_score / 100,
            self.accuracy / 100,
            random.random(),  # Market sentiment (simulated)
            random.random()   # Network congestion (simulated)
        ]])
        
        # Calculate reward based on result
        if result.success:
            reward = (result.actual_profit / opportunity.expected_profit) * 2 - 1  # -1 to 1 scale
        else:
            reward = -0.5
        
        # Train neural network
        target = np.array([[1 if result.success else 0] * 10])
        self.neural_network.train(features, target, reward)
        
        # Update strategy weights
        if result.success:
            self.strategy_weights *= 1.01  # Slight increase
        else:
            self.strategy_weights *= 0.99  # Slight decrease
        
        # Store experience
        self.experience_buffer.append({
            'opportunity': asdict(opportunity),
            'result': asdict(result),
            'reward': reward,
            'timestamp': time.time()
        })
        
        # Keep only recent experiences
        if len(self.experience_buffer) > 1000:
            self.experience_buffer = self.experience_buffer[-1000:]

class NexusSwarmOrchestrator:
    """Main orchestrator for the NEXUS AI swarm"""
    
    def __init__(self):
        self.agents: List[AIAgent] = []
        self.market_data_feed = None
        self.active_opportunities: Dict[str, OpportunitySignal] = {}
        self.execution_results: List[ExecutionResult] = []
        self.swarm_metrics = {
            'total_agents': 0,
            'active_agents': 0,
            'total_profit': 0,
            'success_rate': 0,
            'avg_execution_time': 0,
            'networks_connected': 15
        }
        self.is_running = False
        
    def initialize_swarm(self, num_agents: int = 127):
        """Initialize the AI agent swarm"""
        print(f"🚀 Initializing NEXUS AI Swarm with {num_agents} agents...")
        
        agent_types = [AgentType.ALPHA, AgentType.BETA, AgentType.GAMMA, AgentType.DELTA]
        specializations = {
            AgentType.ALPHA: ["Market_Prediction", "Trend_Analysis", "Volatility_Forecasting", "Sentiment_Analysis"],
            AgentType.BETA: ["Cross_Chain_Arbitrage", "DEX_Arbitrage", "Bridge_Arbitrage", "Flash_Loan_Arbitrage"],
            AgentType.GAMMA: ["MEV_Extraction", "Sandwich_Protection", "Front_Run_Prevention", "Back_Run_Optimization"],
            AgentType.DELTA: ["Risk_Management", "Portfolio_Optimization", "Liquidity_Management", "Loss_Prevention"]
        }
        
        for i in range(num_agents):
            agent_type = agent_types[i % 4]
            specialization = random.choice(specializations[agent_type])
            agent_id = f"NEXUS-{agent_type.value}-{str(i + 1).zfill(3)}"
            
            agent = AIAgent(agent_id, agent_type, specialization)
            agent.status = AgentStatus.ACTIVE if random.random() > 0.1 else AgentStatus.LEARNING
            self.agents.append(agent)
        
        self.swarm_metrics['total_agents'] = len(self.agents)
        self.swarm_metrics['active_agents'] = len([a for a in self.agents if a.status == AgentStatus.ACTIVE])
        
        print(f"✅ NEXUS Swarm initialized with {len(self.agents)} agents")
        print(f"   - Alpha Agents (Market Analysis): {len([a for a in self.agents if a.type == AgentType.ALPHA])}")
        print(f"   - Beta Agents (Arbitrage): {len([a for a in self.agents if a.type == AgentType.BETA])}")
        print(f"   - Gamma Agents (MEV): {len([a for a in self.agents if a.type == AgentType.GAMMA])}")
        print(f"   - Delta Agents (Risk Management): {len([a for a in self.agents if a.type == AgentType.DELTA])}")
    
    def generate_market_data(self) -> MarketData:
        """Generate simulated real-time market data"""
        tokens = ["USDC", "SEI", "ETH", "ATOM", "WBTC", "AVAX", "MATIC", "BNB"]
        exchanges = ["SeiDEX", "Uniswap", "PancakeSwap", "TraderJoe", "QuickSwap"]
        
        prices = {}
        volumes = {}
        
        for token in tokens:
            prices[token] = {}
            volumes[token] = {}
            base_price = random.uniform(0.1, 5000)
            
            for exchange in exchanges:
                # Add some variance between exchanges for arbitrage opportunities
                price_variance = random.uniform(0.995, 1.005)
                prices[token][exchange] = base_price * price_variance
                volumes[token][exchange] = random.uniform(100000, 10000000)
        
        return MarketData(
            timestamp=time.time(),
            prices=prices,
            volumes=volumes,
            liquidity={token: random.uniform(1000000, 100000000) for token in tokens},
            gas_prices={"Sei": 0.001, "Ethereum": 50, "BSC": 5, "Polygon": 30},
            volatility={token: random.uniform(0.01, 0.1) for token in tokens}
        )
    
    async def run_swarm_cycle(self):
        """Run one cycle of the swarm operation"""
        # Generate fresh market data
        market_data = self.generate_market_data()
        
        # Collect opportunities from all agents
        all_opportunities = []
        active_agents = [agent for agent in self.agents if agent.status in [AgentStatus.ACTIVE, AgentStatus.LEARNING]]
        
        # Parallel opportunity analysis
        tasks = []
        for agent in active_agents[:50]:  # Limit concurrent analysis
            task = asyncio.create_task(agent.analyze_market(market_data))
            tasks.append((agent, task))
        
        for agent, task in tasks:
            try:
                opportunities = await task
                for opp in opportunities:
                    opp.agent_id = agent.id
                    all_opportunities.append(opp)
            except Exception as e:
                print(f"❌ Agent {agent.id} analysis failed: {e}")
                agent.status = AgentStatus.ERROR
        
        # Filter and prioritize opportunities
        high_confidence_opportunities = [
            opp for opp in all_opportunities 
            if opp.confidence > 0.8 and opp.expected_profit > 100
        ]
        
        # Sort by expected profit and confidence
        high_confidence_opportunities.sort(
            key=lambda x: x.expected_profit * x.confidence, 
            reverse=True
        )
        
        # Execute top opportunities
        execution_tasks = []
        for opp in high_confidence_opportunities[:20]:  # Execute top 20
            agent = next((a for a in self.agents if a.id == opp.agent_id), None)
            if agent and agent.status == AgentStatus.ACTIVE:
                task = asyncio.create_task(agent.execute_opportunity(opp))
                execution_tasks.append((agent, opp, task))
        
        # Collect execution results
        for agent, opp, task in execution_tasks:
            try:
                result = await task
                self.execution_results.append(result)
                agent.learn_from_result(opp, result)
                
                if result.success:
                    self.swarm_metrics['total_profit'] += result.actual_profit
                    print(f"✅ {agent.id} executed {opp.type}: +${result.actual_profit:.2f}")
                else:
                    print(f"❌ {agent.id} failed {opp.type}: {result.error_message}")
                    
            except Exception as e:
                print(f"❌ Execution failed for {agent.id}: {e}")
        
        # Update swarm metrics
        successful_results = [r for r in self.execution_results if r.success]
        if self.execution_results:
            self.swarm_metrics['success_rate'] = (len(successful_results) / len(self.execution_results)) * 100
            self.swarm_metrics['avg_execution_time'] = np.mean([r.execution_time for r in self.execution_results])
        
        self.swarm_metrics['active_agents'] = len([a for a in self.agents if a.status == AgentStatus.ACTIVE])
        
        # Print cycle summary
        print(f"\n📊 Cycle Summary:")
        print(f"   Opportunities Found: {len(all_opportunities)}")
        print(f"   High Confidence: {len(high_confidence_opportunities)}")
        print(f"   Executed: {len(execution_tasks)}")
        print(f"   Successful: {len([r for r in self.execution_results[-len(execution_tasks):] if r.success])}")
        print(f"   Total Profit: ${self.swarm_metrics['total_profit']:.2f}")
        print(f"   Success Rate: {self.swarm_metrics['success_rate']:.1f}%")
        print(f"   Active Agents: {self.swarm_metrics['active_agents']}/{self.swarm_metrics['total_agents']}")
    
    async def run_swarm(self, cycles: int = 100):
        """Run the NEXUS swarm for specified cycles"""
        print(f"🎯 Starting NEXUS AI Swarm for {cycles} cycles...")
        self.is_running = True
        
        for cycle in range(cycles):
            if not self.is_running:
                break
                
            print(f"\n🔄 Cycle {cycle + 1}/{cycles} - {datetime.now().strftime('%H:%M:%S')}")
            
            try:
                await self.run_swarm_cycle()
                
                # Adaptive learning: Evolve agent strategies
                if cycle % 10 == 0:
                    await self.evolve_agents()
                
                # Brief pause between cycles
                await asyncio.sleep(2)
                
            except Exception as e:
                print(f"❌ Cycle {cycle + 1} failed: {e}")
                continue
        
        print(f"\n🏁 NEXUS Swarm completed {cycles} cycles")
        print(f"📈 Final Metrics:")
        print(f"   Total Profit: ${self.swarm_metrics['total_profit']:.2f}")
        print(f"   Success Rate: {self.swarm_metrics['success_rate']:.1f}%")
        print(f"   Average Execution Time: {self.swarm_metrics['avg_execution_time']:.3f}s")
    
    async def evolve_agents(self):
        """Evolve agent strategies using genetic algorithms"""
        print("🧬 Evolving agent strategies...")
        
        # Sort agents by performance
        self.agents.sort(key=lambda a: a.performance_score, reverse=True)
        
        # Top 25% agents are "elite"
        elite_count = len(self.agents) // 4
        elite_agents = self.agents[:elite_count]
        
        # Bottom 25% agents get new strategies from elite
        for i in range(len(self.agents) - elite_count, len(self.agents)):
            elite_agent = random.choice(elite_agents)
            self.agents[i].strategy_weights = elite_agent.strategy_weights.copy()
            # Add some mutation
            self.agents[i].strategy_weights += np.random.normal(0, 0.1, len(self.agents[i].strategy_weights))
            self.agents[i].performance_score = 85.0  # Reset performance
        
        print(f"✅ Evolved {len(self.agents) - elite_count} agents based on top {elite_count} performers")

class NexusAIAgent:
    def __init__(self, agent_id, agent_type, network_latency):
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.network_latency = network_latency
        self.status = "Idle"
        self.performance = 0.0
        self.profit_24h = 0.0
        self.accuracy = 0.0
        self.trade_history = []

    def update_status(self, status):
        self.status = status

    def simulate_trade(self):
        # Simulate network latency
        time.sleep(self.network_latency / 1000)

        # Simulate trade outcome
        success = random.random() < 0.997  # 99.7% success rate
        amount = random.randint(1000, 50000)
        profit = amount * (random.uniform(0.001, 0.01) if success else -random.uniform(0.0005, 0.002))

        trade = {
            "id": f"T{random.randint(1000, 9999)}",
            "type": random.choice(["Arbitrage", "MEV", "Yield", "Risk_Management"]),
            "tokenPair": f"{random.choice(['ETH', 'BTC', 'SOL', 'BNB'])}/{random.choice(['USDT', 'USDC', 'DAI'])}",
            "amount": amount,
            "profit": profit,
            "network": random.choice(["Sei", "Ethereum", "BSC", "Polygon", "Avalanche", "Arbitrum"]),
            "status": "Success" if success else "Failed"
        }
        self.trade_history.append(trade)
        self.profit_24h += profit
        self.performance = min(100.0, self.performance + random.uniform(-0.5, 0.5)) # Slight fluctuation
        self.accuracy = min(100.0, self.accuracy + random.uniform(-0.2, 0.2)) # Slight fluctuation
        return trade

    def get_metrics(self):
        return {
            "id": self.agent_id,
            "type": self.agent_type,
            "status": self.status,
            "performance": self.performance,
            "profit24h": self.profit_24h,
            "accuracy": self.accuracy
        }

class NexusAIAgentSwarm:
    def __init__(self, num_agents=127, avg_latency=80):
        self.agents = []
        for i in range(num_agents):
            agent_type = random.choice(["Alpha", "Beta", "Gamma", "Delta"])
            latency = avg_latency + random.randint(-20, 20) # Simulate varied latency
            self.agents.append(NexusAIAgent(f"Agent-{i+1:03d}", agent_type, latency))

    def deploy_swarm(self):
        print(f"Deploying {len(self.agents)} NEXUS AI agents...")
        for agent in self.agents:
            agent.update_status("Active")
        print("NEXUS AI Agent Swarm deployed successfully!")

    def get_all_agent_metrics(self):
        return [agent.get_metrics() for agent in self.agents]

    def get_all_trades(self):
        all_trades = []
        for agent in self.agents:
            all_trades.extend(agent.trade_history)
        return all_trades

    def run_simulation(self, duration_seconds):
        start_time = time.time()
        while time.time() - start_time < duration_seconds:
            active_agents = [agent for agent in self.agents if agent.status == "Active" or agent.status == "Executing"]
            if not active_agents:
                print("No active agents to run simulation.")
                break

            # Each active agent attempts a trade
            for agent in active_agents:
                agent.update_status("Executing")
                trade = agent.simulate_trade()
                print(f"Agent {agent.agent_id} executed trade: {trade['id']} - Profit: {trade['profit']:.2f}")
                agent.update_status("Active") # Return to active after trade
            time.sleep(1) # Simulate time passing between trade cycles

async def main():
    """Main function to run the NEXUS AI Swarm simulation"""
    print("🌟 NEXUS AI Multi-Agent Arbitrage Swarm")
    print("=" * 50)
    
    # Initialize the swarm orchestrator
    orchestrator = NexusSwarmOrchestrator()
    
    # Initialize swarm with 127 agents
    orchestrator.initialize_swarm(127)
    
    # Run the swarm
    await orchestrator.run_swarm(50)  # Run for 50 cycles

    # Initialize the Nexus AI Agent Swarm
    swarm = NexusAIAgentSwarm(num_agents=5) # For a smaller local test
    swarm.deploy_swarm()
    print("\nInitial Agent Metrics:")
    for agent_metric in swarm.get_all_agent_metrics():
        print(agent_metric)

    print("\nRunning simulation for 10 seconds...")
    swarm.run_simulation(10)

    print("\nFinal Agent Metrics:")
    for agent_metric in swarm.get_all_agent_metrics():
        print(agent_metric)
    
    print("\nAll Trades:")
    for trade in swarm.get_all_trades():
        print(trade)

if __name__ == "__main__":
    asyncio.run(main())
