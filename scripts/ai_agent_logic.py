import time
import random

class AIAgent:
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
            "type": "Arbitrage", # Simplified for demo
            "tokenPair": f"TOKEN_A/TOKEN_B",
            "amount": amount,
            "profit": profit,
            "network": "Sei Network", # Simplified for demo
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

class AIAgentSwarm:
    def __init__(self, num_agents=127, avg_latency=80):
        self.agents = []
        for i in range(num_agents):
            agent_type = random.choice(["Alpha", "Beta", "Gamma", "Delta"])
            latency = avg_latency + random.randint(-20, 20) # Simulate varied latency
            self.agents.append(AIAgent(f"Agent-{i+1:03d}", agent_type, latency))

    def deploy_swarm(self):
        print(f"Deploying {len(self.agents)} AI agents...")
        for agent in self.agents:
            agent.update_status("Active")
        print("AI Agent Swarm deployed successfully!")

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

if __name__ == "__main__":
    swarm = AIAgentSwarm(num_agents=5) # For a smaller local test
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
