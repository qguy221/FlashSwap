// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Vault.sol";
import "./AccessControl.sol";
import "../utils/ERC20Safe.sol";

/**
 * @title TreasuryManager
 * @dev Advanced treasury management with yield strategies
 */
contract TreasuryManager is AccessControl {
    using ERC20Safe for IERC20;
    
    struct YieldStrategy {
        address strategyContract;
        uint256 allocation; // Percentage in basis points
        uint256 currentDeposit;
        uint256 totalReturns;
        bool isActive;
        string name;
    }
    
    struct TreasuryStats {
        uint256 totalAssets;
        uint256 totalYield;
        uint256 totalFees;
        uint256 availableLiquidity;
        uint256 deployedCapital;
        uint256 lastRebalance;
    }
    
    Vault public vault;
    mapping(address => YieldStrategy[]) public tokenStrategies;
    mapping(address => TreasuryStats) public treasuryStats;
    mapping(address => bool) public authorizedStrategies;
    
    uint256 public rebalanceThreshold = 1000; // 10% in basis points
    uint256 public maxStrategyAllocation = 5000; // 50% max per strategy
    uint256 public emergencyReserve = 2000; // 20% emergency reserve
    
    event StrategyAdded(address indexed token, address strategy, uint256 allocation, string name);
    event StrategyRemoved(address indexed token, address strategy);
    event Rebalanced(address indexed token, uint256 totalAssets);
    event YieldHarvested(address indexed token, address strategy, uint256 yield);
    event EmergencyWithdrawal(address indexed token, address strategy, uint256 amount);
    
    modifier onlyTreasuryManager() {
        require(hasRole(TREASURY_MANAGER_ROLE, msg.sender), "Not treasury manager");
        _;
    }
    
    constructor(address _vault) {
        vault = Vault(_vault);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(TREASURY_MANAGER_ROLE, msg.sender);
    }
    
    /**
     * @dev Add yield strategy for token
     */
    function addStrategy(
        address token,
        address strategyContract,
        uint256 allocation,
        string calldata name
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(strategyContract != address(0), "Invalid strategy");
        require(allocation <= maxStrategyAllocation, "Allocation too high");
        require(authorizedStrategies[strategyContract], "Strategy not authorized");
        
        // Check total allocation doesn't exceed 100%
        uint256 totalAllocation = 0;
        YieldStrategy[] storage strategies = tokenStrategies[token];
        
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].isActive) {
                totalAllocation += strategies[i].allocation;
            }
        }
        
        require(totalAllocation + allocation <= 10000 - emergencyReserve, "Total allocation exceeds limit");
        
        strategies.push(YieldStrategy({
            strategyContract: strategyContract,
            allocation: allocation,
            currentDeposit: 0,
            totalReturns: 0,
            isActive: true,
            name: name
        }));
        
        emit StrategyAdded(token, strategyContract, allocation, name);
    }
    
    /**
     * @dev Remove yield strategy
     */
    function removeStrategy(address token, uint256 strategyIndex) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        YieldStrategy[] storage strategies = tokenStrategies[token];
        require(strategyIndex < strategies.length, "Invalid strategy index");
        
        YieldStrategy storage strategy = strategies[strategyIndex];
        
        // Withdraw all funds from strategy first
        if (strategy.currentDeposit > 0) {
            _withdrawFromStrategy(token, strategyIndex, strategy.currentDeposit);
        }
        
        strategy.isActive = false;
        
        emit StrategyRemoved(token, strategy.strategyContract);
    }
    
    /**
     * @dev Rebalance treasury allocations
     */
    function rebalance(address token) external onlyTreasuryManager {
        uint256 totalBalance = IERC20(token).balanceOf(address(vault));
        require(totalBalance > 0, "No balance to rebalance");
        
        YieldStrategy[] storage strategies = tokenStrategies[token];
        uint256 reserveAmount = (totalBalance * emergencyReserve) / 10000;
        uint256 deployableAmount = totalBalance - reserveAmount;
        
        // Calculate target allocations
        for (uint256 i = 0; i < strategies.length; i++) {
            if (!strategies[i].isActive) continue;
            
            uint256 targetAmount = (deployableAmount * strategies[i].allocation) / 10000;
            uint256 currentAmount = strategies[i].currentDeposit;
            
            if (targetAmount > currentAmount) {
                // Need to deposit more
                uint256 depositAmount = targetAmount - currentAmount;
                _depositToStrategy(token, i, depositAmount);
            } else if (currentAmount > targetAmount) {
                // Need to withdraw some
                uint256 withdrawAmount = currentAmount - targetAmount;
                _withdrawFromStrategy(token, i, withdrawAmount);
            }
        }
        
        // Update stats
        TreasuryStats storage stats = treasuryStats[token];
        stats.totalAssets = totalBalance;
        stats.availableLiquidity = reserveAmount;
        stats.deployedCapital = deployableAmount;
        stats.lastRebalance = block.timestamp;
        
        emit Rebalanced(token, totalBalance);
    }
    
    /**
     * @dev Harvest yield from all strategies
     */
    function harvestYield(address token) external onlyTreasuryManager {
        YieldStrategy[] storage strategies = tokenStrategies[token];
        uint256 totalYield = 0;
        
        for (uint256 i = 0; i < strategies.length; i++) {
            if (!strategies[i].isActive) continue;
            
            uint256 yield = _harvestFromStrategy(token, i);
            strategies[i].totalReturns += yield;
            totalYield += yield;
            
            if (yield > 0) {
                emit YieldHarvested(token, strategies[i].strategyContract, yield);
            }
        }
        
        // Update treasury stats
        treasuryStats[token].totalYield += totalYield;
    }
    
    /**
     * @dev Get treasury performance metrics
     */
    function getTreasuryPerformance(address token) 
        external 
        view 
        returns (
            uint256 totalAssets,
            uint256 totalYield,
            uint256 yieldRate,
            uint256 utilizationRate,
            uint256 strategyCount
        ) 
    {
        TreasuryStats memory stats = treasuryStats[token];
        totalAssets = stats.totalAssets;
        totalYield = stats.totalYield;
        
        // Calculate annualized yield rate (simplified)
        if (stats.totalAssets > 0 && stats.lastRebalance > 0) {
            uint256 timeElapsed = block.timestamp - stats.lastRebalance;
            if (timeElapsed > 0) {
                yieldRate = (stats.totalYield * 365 days * 10000) / (stats.totalAssets * timeElapsed);
            }
        }
        
        // Calculate utilization rate
        if (stats.totalAssets > 0) {
            utilizationRate = (stats.deployedCapital * 10000) / stats.totalAssets;
        }
        
        // Count active strategies
        YieldStrategy[] memory strategies = tokenStrategies[token];
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].isActive) {
                strategyCount++;
            }
        }
    }
    
    /**
     * @dev Emergency withdrawal from strategy
     */
    function emergencyWithdrawFromStrategy(
        address token,
        uint256 strategyIndex,
        uint256 amount
    ) external onlyRole(EMERGENCY_ROLE) {
        _withdrawFromStrategy(token, strategyIndex, amount);
        
        YieldStrategy storage strategy = tokenStrategies[token][strategyIndex];
        emit EmergencyWithdrawal(token, strategy.strategyContract, amount);
    }
    
    /**
     * @dev Internal function to deposit to strategy
     */
    function _depositToStrategy(address token, uint256 strategyIndex, uint256 amount) 
        internal 
    {
        YieldStrategy storage strategy = tokenStrategies[token][strategyIndex];
        
        // Transfer tokens from vault to strategy
        // This would call the actual strategy contract
        // For now, just update the accounting
        strategy.currentDeposit += amount;
    }
    
    /**
     * @dev Internal function to withdraw from strategy
     */
    function _withdrawFromStrategy(address token, uint256 strategyIndex, uint256 amount) 
        internal 
    {
        YieldStrategy storage strategy = tokenStrategies[token][strategyIndex];
        require(strategy.currentDeposit >= amount, "Insufficient strategy balance");
        
        // Withdraw from actual strategy contract
        // For now, just update the accounting
        strategy.currentDeposit -= amount;
    }
    
    /**
     * @dev Internal function to harvest from strategy
     */
    function _harvestFromStrategy(address token, uint256 strategyIndex) 
        internal 
        returns (uint256 yield) 
    {
        // This would call the actual strategy contract to harvest yield
        // For now, simulate some yield (0.1% of deposited amount)
        YieldStrategy storage strategy = tokenStrategies[token][strategyIndex];
        yield = (strategy.currentDeposit * 10) / 10000; // 0.1%
        
        return yield;
    }
    
    // Admin functions
    function authorizeStrategy(address strategy) external onlyRole(DEFAULT_ADMIN_ROLE) {
        authorizedStrategies[strategy] = true;
    }
    
    function setRebalanceThreshold(uint256 threshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(threshold <= 5000, "Threshold too high"); // Max 50%
        rebalanceThreshold = threshold;
    }
    
    function setMaxStrategyAllocation(uint256 allocation) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(allocation <= 8000, "Allocation too high"); // Max 80%
        maxStrategyAllocation = allocation;
    }
    
    function setEmergencyReserve(uint256 reserve) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(reserve >= 1000 && reserve <= 5000, "Invalid reserve"); // 10-50%
        emergencyReserve = reserve;
    }
}
