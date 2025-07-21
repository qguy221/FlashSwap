// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IRouterA.sol";
import "./IRouterB.sol";
import "../utils/ERC20Safe.sol";

/**
 * @title ArbExecutor
 * @dev Main arbitrage execution contract
 */
contract ArbExecutor {
    using ERC20Safe for IERC20;
    
    struct ExecutionParams {
        address tokenA;
        address tokenB;
        address dexA;
        address dexB;
        uint256 amountIn;
        uint256 minAmountOut;
        uint256 deadline;
        bytes routerCallDataA;
        bytes routerCallDataB;
    }
    
    struct ExecutionResult {
        bool success;
        uint256 amountOut;
        uint256 profit;
        uint256 gasUsed;
        string errorMessage;
    }
    
    mapping(address => bool) public authorizedAgents;
    mapping(address => bool) public authorizedRouters;
    mapping(address => uint256) public agentBalances;
    
    address public owner;
    address public treasury;
    uint256 public feeRate = 100; // 1% in basis points
    uint256 public constant MAX_FEE_RATE = 500; // 5% max
    
    event ArbitrageExecuted(
        address indexed agent,
        address tokenA,
        address tokenB,
        uint256 amountIn,
        uint256 amountOut,
        uint256 profit,
        uint256 fee
    );
    
    event EmergencyStop(address indexed agent, string reason);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender], "Not authorized agent");
        _;
    }
    
    constructor(address _treasury) {
        owner = msg.sender;
        treasury = _treasury;
        authorizedAgents[msg.sender] = true;
    }
    
    /**
     * @dev Execute arbitrage between two DEXs
     */
    function executeArbitrage(ExecutionParams calldata params) 
        external 
        onlyAuthorizedAgent 
        returns (ExecutionResult memory result) 
    {
        uint256 gasStart = gasleft();
        
        // Validate parameters
        require(params.deadline > block.timestamp, "Deadline passed");
        require(params.amountIn > 0, "Invalid amount");
        require(authorizedRouters[params.dexA] && authorizedRouters[params.dexB], "Unauthorized router");
        
        // Check agent balance
        require(agentBalances[msg.sender] >= params.amountIn, "Insufficient balance");
        
        try this._executeArbitrageInternal(params) returns (uint256 amountOut, uint256 profit) {
            uint256 gasUsed = gasStart - gasleft();
            
            // Calculate and deduct fee
            uint256 fee = (profit * feeRate) / 10000;
            uint256 netProfit = profit - fee;
            
            // Update balances
            agentBalances[msg.sender] = agentBalances[msg.sender] - params.amountIn + params.amountIn + netProfit;
            agentBalances[treasury] += fee;
            
            result = ExecutionResult({
                success: true,
                amountOut: amountOut,
                profit: netProfit,
                gasUsed: gasUsed,
                errorMessage: ""
            });
            
            emit ArbitrageExecuted(
                msg.sender,
                params.tokenA,
                params.tokenB,
                params.amountIn,
                amountOut,
                netProfit,
                fee
            );
            
        } catch Error(string memory reason) {
            result = ExecutionResult({
                success: false,
                amountOut: 0,
                profit: 0,
                gasUsed: gasStart - gasleft(),
                errorMessage: reason
            });
            
            emit EmergencyStop(msg.sender, reason);
        }
    }
    
    /**
     * @dev Internal arbitrage execution logic
     */
    function _executeArbitrageInternal(ExecutionParams calldata params) 
        external 
        returns (uint256 amountOut, uint256 profit) 
    {
        require(msg.sender == address(this), "Internal function");
        
        IERC20 tokenA = IERC20(params.tokenA);
        IERC20 tokenB = IERC20(params.tokenB);
        
        uint256 initialBalanceA = tokenA.balanceOf(address(this));
        uint256 initialBalanceB = tokenB.balanceOf(address(this));
        
        // Step 1: Buy tokenB on dexA
        tokenA.safeApprove(params.dexA, params.amountIn);
        
        (bool success1, bytes memory result1) = params.dexA.call(params.routerCallDataA);
        require(success1, "DEX A swap failed");
        
        uint256 intermediateBalance = tokenB.balanceOf(address(this));
        uint256 amountB = intermediateBalance - initialBalanceB;
        
        // Step 2: Sell tokenB on dexB
        tokenB.safeApprove(params.dexB, amountB);
        
        (bool success2, bytes memory result2) = params.dexB.call(params.routerCallDataB);
        require(success2, "DEX B swap failed");
        
        uint256 finalBalanceA = tokenA.balanceOf(address(this));
        amountOut = finalBalanceA - initialBalanceA;
        
        require(amountOut >= params.minAmountOut, "Insufficient output");
        
        profit = amountOut > params.amountIn ? amountOut - params.amountIn : 0;
    }
    
    /**
     * @dev Flash loan arbitrage (advanced)
     */
    function executeFlashArbitrage(
        address flashLoanProvider,
        uint256 flashAmount,
        ExecutionParams calldata params,
        bytes calldata flashLoanData
    ) external onlyAuthorizedAgent {
        // Implementation for flash loan arbitrage
        // This would integrate with flash loan providers like Aave, dYdX, etc.
        revert("Flash arbitrage not implemented yet");
    }
    
    /**
     * @dev Emergency stop function
     */
    function emergencyStop(string calldata reason) external onlyAuthorizedAgent {
        emit EmergencyStop(msg.sender, reason);
        // Additional emergency logic here
    }
    
    /**
     * @dev Deposit funds for agent
     */
    function deposit(uint256 amount) external {
        IERC20(0x0000000000000000000000000000000000000000).safeTransferFrom(msg.sender, address(this), amount); // Placeholder for SEI token
        agentBalances[msg.sender] += amount;
    }
    
    /**
     * @dev Withdraw funds
     */
    function withdraw(uint256 amount) external {
        require(agentBalances[msg.sender] >= amount, "Insufficient balance");
        agentBalances[msg.sender] -= amount;
        IERC20(0x0000000000000000000000000000000000000000).safeTransfer(msg.sender, amount); // Placeholder for SEI token
    }
    
    // Admin functions
    function addAuthorizedAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = true;
    }
    
    function addAuthorizedRouter(address router) external onlyOwner {
        authorizedRouters[router] = true;
    }
    
    function setFeeRate(uint256 newFeeRate) external onlyOwner {
        require(newFeeRate <= MAX_FEE_RATE, "Fee rate too high");
        feeRate = newFeeRate;
    }
    
    function setTreasury(address newTreasury) external onlyOwner {
        treasury = newTreasury;
    }
}
