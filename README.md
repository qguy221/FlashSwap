# Flash-Swap Yield Arb Agent

AI-powered flash-swap arbitrage and auto-yield rebalancer agent on Sei network.

## Quick Start

1. `cp .env.sample .env` and fill in your Sei RPC, private key, etc.
2. `yarn` to install deps
3. `npx hardhat run scripts/deploy.js --network sei` to deploy contract
4. Update `config.json` with deployed address
5. `python agent/ai_agent.py` to run the agent

## Customize

Edit `config.json` for DEX/vault whitelists, risk params, etc.