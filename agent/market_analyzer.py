import aiohttp
import asyncio
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from statsmodels.tsa.arima.model import ARIMA
from web3 import Web3

class MarketAnalyzer:
    def __init__(self, config):
        self.config = config
        self.dexes = config['dex_whitelist']
        self.session = aiohttp.ClientSession()
        self.w3 = Web3(Web3.HTTPProvider(config['sei_rpc']))

    async def fetch_price(self, dex, token_in, token_out):
        # Real implementation using Web3 to call DEX contract for price
        # Assume DEX has a getPrice function
        dex_contract = self.w3.eth.contract(address=dex, abi=self.config['dex_abi'])
        price = dex_contract.functions.getPrice(token_in, token_out).call()
        return price / 10**18  # Assuming 18 decimals

    async def detect_opportunities(self):
        opportunities = []
        for dex1 in self.dexes:
            for dex2 in self.dexes:
                if dex1 != dex2:
                    price1 = await self.fetch_price(dex1, 'TOKENA', 'TOKENB')
                    price2 = await self.fetch_price(dex2, 'TOKENA', 'TOKENB')
                    spread = abs(price1 - price2) / min(price1, price2)
                    if spread > 0.01:  # Threshold
                        opportunities.append({
                            'dex_buy': dex1 if price1 < price2 else dex2,
                            'dex_sell': dex2 if price1 < price2 else dex1,
                            'spread': spread
                        })
        return opportunities

    def predict_trend(self, historical_prices):
        if len(historical_prices) < 10:
            return False
        X = np.array(range(len(historical_prices))).reshape(-1, 1)
        y = np.array(historical_prices)
        model = RandomForestRegressor(n_estimators=100)
        model.fit(X, y)
        next_x = np.array([[len(historical_prices)]])
        forecast = model.predict(next_x)[0]
        return forecast > y[-1]  # Predict uptrend

    async def detect_yield_opportunities(self):
        # Real check for vault APYs using Web3
        yields = {}
        for vault in self.config['vault_whitelist']:
            vault_contract = self.w3.eth.contract(address=vault, abi=self.config['vault_abi'])
            apy = vault_contract.functions.getAPY().call()
            yields[vault] = apy / 100  # Assuming percentage
        best_yield = max(yields, key=yields.get) if yields else None
        return {'vault': best_yield, 'apy': yields.get(best_yield)} if best_yield else None