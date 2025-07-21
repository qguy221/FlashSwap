import json
from MarketFetcher import MarketFetcher

class OpportunityScanner:
    def __init__(self, config):
        self.config = config
        self.fetcher = MarketFetcher(config)

    def scan_arbitrage(self):
        order_books = self.fetcher.fetch_order_books(self.config['dex_whitelist'])
        opportunities = []
        # Logic to detect price discrepancies
        for token in self.config['token_whitelist']:
            prices = {dex: order_books.get(dex, {}).get(token, 0) for dex in order_books}
            if max(prices.values()) - min(prices.values()) > self.config['profit_threshold']:
                opportunities.append({'token': token, 'buy_dex': min(prices, key=prices.get), 'sell_dex': max(prices, key=prices.get)})
        return opportunities

    def scan_yield(self):
        # Logic to scan yield opportunities from vaults
        yields = {}
        for vault in self.config['vault_whitelist']:
            # Assume API or contract call to get APY
            yields[vault] = 5.0  # Placeholder
        best_yield = max(yields, key=yields.get)
        return {'vault': best_yield, 'apy': yields[best_yield]}