import numpy as np

class RiskManager:
    def __init__(self, config):
        self.config = config
        self.kelly_fraction = config['risk_params']['kelly_fraction']

    def assess_risk(self, opportunity):
        # Calculate risk score (0-1), lower is better
        risk_score = np.random.uniform(0, 1)  # Mock
        # Kelly criterion for position size
        expected_return = opportunity['spread'] - 0.005  # Adjust for fees/slippage
        variance = 0.01  # Mock variance
        kelly = (expected_return / variance) * self.kelly_fraction
        tx_size = min(kelly, 1.0) * 1000000  # Example max size
        return risk_score, tx_size