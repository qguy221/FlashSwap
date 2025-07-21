import json
import requests
from web3 import Web3

class MarketFetcher:
    def __init__(self, config):
        self.config = config
        self.w3 = Web3(Web3.HTTPProvider(config['sei_rpc']))

    def fetch_order_books(self, dexes):
        order_books = {}
        for dex in dexes:
            # Placeholder for fetching order book from DEX API or contract
            response = requests.get(f"{dex['api']}/orderbook")  # Assume API endpoint
            if response.status_code == 200:
                order_books[dex['name']] = response.json()
            else:
                order_books[dex['name']] = {}
        return order_books

    def fetch_prices(self, tokens):
        prices = {}
        for token in tokens:
            # Use Chainlink or other oracle if available on Sei
            prices[token] = self.get_price_from_oracle(token)
        return prices

    def get_price_from_oracle(self, token):
        # Implement oracle call
        return 1.0  # Placeholder