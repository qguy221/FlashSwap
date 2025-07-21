// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ArbExecutor.sol";
import "../utils/ERC20Safe.sol";

/**
 * @title FlashLoanExecutor
 * @dev Advanced arbitrage executor with flash loan capabilities
 */
contract FlashLoanExecutor {
    using ERC20Safe for IERC20;
    
    struct FlashLoanParams {
        address asset;
        uint256 amount;
        address dexA;
        address dexB;
        address tokenA;
        address tokenB;
        uint256 minProfit;
        bytes swapDataA;
        bytes swapDataB;
    }
    
    struct FlashLoanResult {
        bool success;
        uint256 profit;
        uint256 gasUsed;
        string errorMessage;
    }
    
    ArbExecutor public arbExecutor;
    mapping(address => bool) public authorizedFlashLenders;
    mapping(address => bool) public authorizedAgents;
    
    address public owner;
    uint256 public flashLoanFee = 9; // 0.09% default flash loan fee
    
    event FlashArbitrageExecuted(
        address indexed agent,
        address asset,
        uint256 amount,
        uint256 profit,
        address dexA,
        address dexB
    );
    
    event FlashLoanFailed(
        address indexed agent,
        address asset,
        uint256 amount,
        string reason
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender], "Not authorized agent");
        _;
    }
    
    constructor(address _arbExecutor) {
        owner = msg.sender;
        arbExecutor = ArbExecutor(_arbExecutor);
        authorizedAgents[msg.sender] = true;
    }
    
    /**
     * @dev Execute flash loan arbitrage
     */
    function executeFlashArbitrage(FlashLoanParams calldata params) 
        external 
        onlyAuthorizedAgent 
        returns (FlashLoanResult memory result) 
    {
        uint256 gasStart = gasleft();
        
        // Validate parameters
        require(params.amount > 0, "Invalid amount");
        require(params.minProfit > 0, "Invalid min profit");
        
        try this._executeFlashLoanInternal(params) returns (uint256 profit) {
            result = FlashLoanResult({
                success: true,
                profit: profit,
                gasUsed: gasStart - gasleft(),
                errorMessage: ""
            });
            
            emit FlashArbitrageExecuted(
                msg.sender,
                params.asset,
                params.amount,
                profit,
                params.dexA,
                params.dexB
            );
            
        } catch Error(string memory reason) {
            result = FlashLoanResult({
                success: false,
                profit: 0,
                gasUsed: gasStart - gasleft(),
                errorMessage: reason
            });
            
            emit FlashLoanFailed(msg.sender, params.asset, params.amount, reason);
        }
    }
    
    /**
     * @dev Internal flash loan execution
     */
    function _executeFlashLoanInternal(FlashLoanParams calldata params) 
        external 
        returns (uint256 profit) 
    {
        require(msg.sender == address(this), "Internal function");
        
        // This would integrate with actual flash loan providers
        // For now, simulate the flash loan process
        
        IERC20 asset = IERC20(params.asset);
        uint256 initialBalance = asset.balanceOf(address(this));
        
        // Simulate receiving flash loan
        // In reality, this would be called by the flash loan provider
        _receiveFlashLoan(params.asset, params.amount, params);
        
        uint256 finalBalance = asset.balanceOf(address(this));
        
        // Calculate profit (after repaying flash loan + fee)
        uint256 flashLoanRepayment = params.amount + (params.amount * flashLoanFee) / 10000;
        
        require(finalBalance >= initialBalance + flashLoanRepayment, "Insufficient funds to repay");
        
        profit = finalBalance - initialBalance - flashLoanRepayment;
        require(profit >= params.minProfit, "Profit below minimum");
    }
    
    /**
     * @dev Simulate receiving flash loan and executing arbitrage
     */
    function _receiveFlashLoan(
        address asset,
        uint256 amount,
        FlashLoanParams memory params
    ) internal {
        IERC20 token = IERC20(asset);
        
        // Step 1: Use flash loan to buy on DEX A
        token.safeApprove(params.dexA, amount);
        
        (bool success1, ) = params.dexA.call(params.swapDataA);
        require(success1, "DEX A swap failed");
        
        // Step 2: Sell on DEX B
        IERC20 tokenB = IERC20(params.tokenB);
        uint256 tokenBBalance = tokenB.balanceOf(address(this));
        
        tokenB.safeApprove(params.dexB, tokenBBalance);
        
        (bool success2, ) = params.dexB.call(params.swapDataB);
        require(success2, "DEX B swap failed");
        
        // At this point, we should have more of the original asset
        // The profit calculation happens in the calling function
    }
    
    /**
     * @dev Calculate optimal flash loan amount
     */
    function calculateOptimalAmount(
        address tokenA,
        address tokenB,
        address dexA,
        address dexB,
        uint256 maxAmount
    ) external view returns (uint256 optimalAmount, uint256 expectedProfit) {
        // Simplified calculation - in production this would be more sophisticated
        
        // Get current prices from both DEXs
        uint256 priceA = _getPrice(tokenA, tokenB, dexA);
        uint256 priceB = _getPrice(tokenA, tokenB, dexB);
        
        if (priceA == 0 || priceB == 0) {
            return (0, 0);
        }
        
        // Calculate spread
        uint256 spread = priceA > priceB ? priceA - priceB : priceB - priceA;
        
        // Simple optimization: use 50% of max amount if spread > 1%
        if (spread > 100) { // 1% in basis points
            optimalAmount = maxAmount / 2;
            expectedProfit = (optimalAmount * spread) / 10000;
            
            // Subtract flash loan fee
            uint256 flashFee = (optimalAmount * flashLoanFee) / 10000;
            expectedProfit = expectedProfit > flashFee ? expectedProfit - flashFee : 0;
        } else {
            optimalAmount = 0;
            expectedProfit = 0;
        }
    }
    
    /**
     * @dev Get price from DEX (simplified)
     */
    function _getPrice(address tokenA, address tokenB, address dex) 
        internal 
        view 
        returns (uint256 price) 
    {
        // This would integrate with actual DEX price feeds
        // For now, return a mock price
        return 1000000; // $1 in 6 decimals
    }
    
    /**
     * @dev Emergency withdrawal
     */
    function emergencyWithdraw(address token, uint256 amount) 
        external 
        onlyOwner 
    {
        IERC20(token).safeTransfer(owner, amount);
    }
    
    // Admin functions
    function addAuthorizedAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = true;
    }
    
    function addAuthorizedFlashLender(address lender) external onlyOwner {
        authorizedFlashLenders[lender] = true;
    }
    
    function setFlashLoanFee(uint256 fee) external onlyOwner {
        require(fee <= 100, "Fee too high"); // Max 1%
        flashLoanFee = fee;
    }
    
    function setArbExecutor(address newExecutor) external onlyOwner {
        arbExecutor = ArbExecutor(newExecutor);
    }
}
