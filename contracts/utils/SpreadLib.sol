// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SpreadLib
 * @dev Library for calculating price spreads and arbitrage metrics
 */
library SpreadLib {
    
    /**
     * @dev Calculate spread between two prices in basis points
     */
    function calculateSpread(uint256 priceA, uint256 priceB) 
        internal 
        pure 
        returns (uint256 spread) 
    {
        if (priceA == 0 || priceB == 0) return 0;
        
        uint256 higher = priceA > priceB ? priceA : priceB;
        uint256 lower = priceA < priceB ? priceA : priceB;
        
        // Calculate spread as percentage in basis points
        spread = ((higher - lower) * 10000) / lower;
    }
    
    /**
     * @dev Calculate price impact for given trade size
     */
    function calculatePriceImpact(
        uint256 reserveIn,
        uint256 reserveOut,
        uint256 amountIn
    ) internal pure returns (uint256 priceImpact) {
        if (reserveIn == 0 || reserveOut == 0 || amountIn == 0) return 0;
        
        // Using constant product formula: x * y = k
        uint256 amountOut = (amountIn * reserveOut) / (reserveIn + amountIn);
        uint256 priceBeforeTrade = (reserveOut * 1e18) / reserveIn;
        uint256 priceAfterTrade = ((reserveOut - amountOut) * 1e18) / (reserveIn + amountIn);
        
        if (priceAfterTrade >= priceBeforeTrade) return 0;
        
        priceImpact = ((priceBeforeTrade - priceAfterTrade) * 10000) / priceBeforeTrade;
    }
    
    /**
     * @dev Calculate optimal trade size for maximum profit
     */
    function calculateOptimalTradeSize(
        uint256 reserveA1,
        uint256 reserveA2,
        uint256 reserveB1,
        uint256 reserveB2
    ) internal pure returns (uint256 optimalSize) {
        // Simplified calculation for optimal arbitrage size
        // In practice, this would use more sophisticated math
        
        if (reserveA1 == 0 || reserveA2 == 0 || reserveB1 == 0 || reserveB2 == 0) {
            return 0;
        }
        
        // Calculate price difference
        uint256 priceA = (reserveB1 * 1e18) / reserveA1;
        uint256 priceB = (reserveB2 * 1e18) / reserveA2;
        
        if (priceA <= priceB) return 0;
        
        // Simple heuristic: use 1% of smaller reserve
        uint256 minReserve = reserveA1 < reserveA2 ? reserveA1 : reserveA2;
        optimalSize = minReserve / 100;
    }
    
    /**
     * @dev Calculate slippage for trade
     */
    function calculateSlippage(
        uint256 expectedOutput,
        uint256 actualOutput
    ) internal pure returns (uint256 slippage) {
        if (expectedOutput == 0) return 0;
        
        if (actualOutput >= expectedOutput) return 0;
        
        slippage = ((expectedOutput - actualOutput) * 10000) / expectedOutput;
    }
    
    /**
     * @dev Calculate minimum output with slippage tolerance
     */
    function calculateMinOutput(
        uint256 expectedOutput,
        uint256 slippageTolerance
    ) internal pure returns (uint256 minOutput) {
        require(slippageTolerance <= 10000, "Invalid slippage tolerance");
        
        minOutput = (expectedOutput * (10000 - slippageTolerance)) / 10000;
    }
    
    /**
     * @dev Check if arbitrage opportunity is profitable after fees
     */
    function isProfitableAfterFees(
        uint256 amountIn,
        uint256 amountOut,
        uint256 gasCost,
        uint256 tradingFees
    ) internal pure returns (bool profitable, uint256 netProfit) {
        if (amountOut <= amountIn) return (false, 0);
        
        uint256 grossProfit = amountOut - amountIn;
        uint256 totalCosts = gasCost + tradingFees;
        
        if (grossProfit <= totalCosts) return (false, 0);
        
        netProfit = grossProfit - totalCosts;
        profitable = true;
    }
    
    /**
     * @dev Calculate compound annual growth rate (CAGR)
     */
    function calculateCAGR(
        uint256 initialValue,
        uint256 finalValue,
        uint256 timeInSeconds
    ) internal pure returns (uint256 cagr) {
        if (initialValue == 0 || finalValue <= initialValue || timeInSeconds == 0) {
            return 0;
        }
        
        // Simplified CAGR calculation (approximation)
        uint256 growthRatio = (finalValue * 1e18) / initialValue;
        uint256 annualizedTime = (timeInSeconds * 1e18) / 365 days;
        
        // Approximate CAGR using linear approximation for small growth rates
        cagr = ((growthRatio - 1e18) * 1e18) / annualizedTime;
    }
    
    /**
     * @dev Calculate Sharpe ratio for strategy performance
     */
    function calculateSharpeRatio(
        uint256 averageReturn,
        uint256 riskFreeRate,
        uint256 standardDeviation
    ) internal pure returns (uint256 sharpeRatio) {
        if (standardDeviation == 0) return 0;
        
        if (averageReturn <= riskFreeRate) return 0;
        
        uint256 excessReturn = averageReturn - riskFreeRate;
        sharpeRatio = (excessReturn * 1e18) / standardDeviation;
    }
    
    /**
     * @dev Calculate maximum drawdown
     */
    function calculateMaxDrawdown(
        uint256[] memory values
    ) internal pure returns (uint256 maxDrawdown) {
        if (values.length < 2) return 0;
        
        uint256 peak = values[0];
        uint256 maxDD = 0;
        
        for (uint256 i = 1; i < values.length; i++) {
            if (values[i] > peak) {
                peak = values[i];
            } else {
                uint256 drawdown = ((peak - values[i]) * 10000) / peak;
                if (drawdown > maxDD) {
                    maxDD = drawdown;
                }
            }
        }
        
        maxDrawdown = maxDD;
    }
}
