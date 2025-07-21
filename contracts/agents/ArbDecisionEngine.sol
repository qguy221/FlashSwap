// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ArbDecisionRegistry.sol";
import "../scan/PoolScanner.sol";

/**
 * @title ArbDecisionEngine
 * @dev AI-powered decision engine for arbitrage opportunities
 */
contract ArbDecisionEngine {
    enum DecisionType { EXECUTE, SKIP, MONITOR, RETRY }
    enum RiskLevel { LOW, MEDIUM, HIGH, EXTREME }
    
    struct DecisionFactors {
        uint256 spread;
        uint256 liquidity;
        uint256 volatility;
        uint256 gasPrice;
        uint256 networkCongestion;
        uint256 historicalSuccess;
        uint256 timeOfDay;
        uint256 marketCondition;
    }
    
    struct DecisionWeights {
        uint256 spreadWeight;
        uint256 liquidityWeight;
        uint256 volatilityWeight;
        uint256 gasPriceWeight;
        uint256 congestionWeight;
        uint256 historyWeight;
        uint256 timingWeight;
        uint256 marketWeight;
    }
    
    struct AgentProfile {
        uint256 riskTolerance; // 0-100
        uint256 minProfitThreshold;
        uint256 maxGasPrice;
        uint256 preferredTimeSlots; // Bitmap for hours
        bool isActive;
        uint256 totalDecisions;
        uint256 successfulDecisions;
        uint256 totalProfit;
    }
    
    ArbDecisionRegistry public decisionRegistry;
    PoolScanner public poolScanner;
    
    mapping(address => AgentProfile) public agentProfiles;
    mapping(address => bool) public authorizedAgents;
    
    DecisionWeights public defaultWeights = DecisionWeights({
        spreadWeight: 25,
        liquidityWeight: 20,
        volatilityWeight: 15,
        gasPriceWeight: 10,
        congestionWeight: 10,
        historyWeight: 10,
        timingWeight: 5,
        marketWeight: 5
    });
    
    address public owner;
    uint256 public minSpreadThreshold = 50; // 0.5%
    uint256 public maxRiskScore = 70; // Max 70% risk
    
    event DecisionMade(
        address indexed agent,
        address tokenA,
        address tokenB,
        DecisionType decision,
        uint256 confidence,
        uint256 riskScore,
        string reasoning
    );
    
    event AgentProfileUpdated(
        address indexed agent,
        uint256 riskTolerance,
        uint256 minProfitThreshold
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender], "Not authorized agent");
        _;
    }
    
    constructor(address _decisionRegistry, address _poolScanner) {
        owner = msg.sender;
        decisionRegistry = ArbDecisionRegistry(_decisionRegistry);
        poolScanner = PoolScanner(_poolScanner);
        authorizedAgents[msg.sender] = true;
        
        // Set default profile for owner
        agentProfiles[msg.sender] = AgentProfile({
            riskTolerance: 60,
            minProfitThreshold: 100, // $100
            maxGasPrice: 50 gwei,
            preferredTimeSlots: 0xFFFFFFFFFFFFFFFF, // All hours
            isActive: true,
            totalDecisions: 0,
            successfulDecisions: 0,
            totalProfit: 0
        });
    }
    
    /**
     * @dev Make arbitrage decision based on opportunity and agent profile
     */
    function makeDecision(
        address tokenA,
        address tokenB,
        address dexA,
        address dexB
    ) external onlyAuthorizedAgent returns (
        DecisionType decision,
        uint256 confidence,
        uint256 riskScore,
        string memory reasoning
    ) {
        // Get opportunity data
        PoolScanner.ArbitrageOpportunity memory opportunity = poolScanner.scanArbitrageOpportunity(
            tokenA, tokenB, dexA, dexB
        );
        
        if (!opportunity.isValid) {
            return (DecisionType.SKIP, 0, 100, "Invalid opportunity");
        }
        
        // Get agent profile
        AgentProfile memory profile = agentProfiles[msg.sender];
        if (!profile.isActive) {
            return (DecisionType.SKIP, 0, 100, "Agent inactive");
        }
        
        // Collect decision factors
        DecisionFactors memory factors = _collectDecisionFactors(opportunity);
        
        // Calculate decision score
        (decision, confidence, riskScore, reasoning) = _calculateDecision(
            opportunity,
            factors,
            profile
        );
        
        // Record decision
        uint256 decisionId = decisionRegistry.recordDecision(
            tokenA,
            tokenB,
            dexA,
            dexB,
            ArbDecisionRegistry.DecisionType(uint8(decision)),
            confidence,
            reasoning,
            opportunity.profitPotential,
            riskScore
        );
        
        // Update agent stats
        agentProfiles[msg.sender].totalDecisions++;
        
        emit DecisionMade(
            msg.sender,
            tokenA,
            tokenB,
            decision,
            confidence,
            riskScore,
            reasoning
        );
    }
    
    /**
     * @dev Collect all factors for decision making
     */
    function _collectDecisionFactors(PoolScanner.ArbitrageOpportunity memory opportunity) 
        internal 
        view 
        returns (DecisionFactors memory factors) 
    {
        factors.spread = opportunity.spread;
        factors.liquidity = _estimateLiquidity(opportunity.dexA, opportunity.dexB);
        factors.volatility = _getVolatility(opportunity.tokenA, opportunity.tokenB);
        factors.gasPrice = tx.gasprice;
        factors.networkCongestion = _getNetworkCongestion();
        factors.historicalSuccess = _getHistoricalSuccess(msg.sender);
        factors.timeOfDay = (block.timestamp % 86400) / 3600; // Hour of day
        factors.marketCondition = _getMarketCondition();
    }
    
    /**
     * @dev Calculate final decision based on all factors
     */
    function _calculateDecision(
        PoolScanner.ArbitrageOpportunity memory opportunity,
        DecisionFactors memory factors,
        AgentProfile memory profile
    ) internal view returns (
        DecisionType decision,
        uint256 confidence,
        uint256 riskScore,
        string memory reasoning
    ) {
        // Calculate base score
        uint256 baseScore = _calculateBaseScore(factors);
        
        // Apply agent profile adjustments
        uint256 adjustedScore = _applyProfileAdjustments(baseScore, factors, profile);
        
        // Calculate risk score
        riskScore = _calculateRiskScore(factors, profile);
        
        // Make decision based on score and risk
        if (adjustedScore >= 80 && riskScore <= profile.riskTolerance) {
            decision = DecisionType.EXECUTE;
            confidence = adjustedScore;
            reasoning = "High confidence, acceptable risk";
        } else if (adjustedScore >= 60 && riskScore <= profile.riskTolerance + 10) {
            decision = DecisionType.MONITOR;
            confidence = adjustedScore;
            reasoning = "Moderate confidence, monitor for better conditions";
        } else if (adjustedScore >= 40) {
            decision = DecisionType.RETRY;
            confidence = adjustedScore;
            reasoning = "Low confidence, retry later";
        } else {
            decision = DecisionType.SKIP;
            confidence = adjustedScore;
            reasoning = "Insufficient confidence or high risk";
        }
        
        // Additional checks
        if (factors.spread < minSpreadThreshold) {
            decision = DecisionType.SKIP;
            reasoning = "Spread below minimum threshold";
        }
        
        if (riskScore > maxRiskScore) {
            decision = DecisionType.SKIP;
            reasoning = "Risk score exceeds maximum allowed";
        }
        
        if (opportunity.profitPotential < profile.minProfitThreshold) {
            decision = DecisionType.SKIP;
            reasoning = "Profit below agent minimum threshold";
        }
    }
    
    /**
     * @dev Calculate base decision score
     */
    function _calculateBaseScore(DecisionFactors memory factors) 
        internal 
        view 
        returns (uint256 score) 
    {
        DecisionWeights memory weights = defaultWeights;
        
        // Spread score (higher spread = higher score)
        uint256 spreadScore = factors.spread > 500 ? 100 : (factors.spread * 100) / 500;
        
        // Liquidity score (higher liquidity = higher score)
        uint256 liquidityScore = factors.liquidity > 1000000 ? 100 : (factors.liquidity * 100) / 1000000;
        
        // Volatility score (lower volatility = higher score)
        uint256 volatilityScore = factors.volatility < 100 ? 100 : (10000 / (factors.volatility + 100));
        
        // Gas price score (lower gas = higher score)
        uint256 gasScore = factors.gasPrice < 20 gwei ? 100 : (2000 gwei / (factors.gasPrice + 20 gwei));
        
        // Network congestion score (lower congestion = higher score)
        uint256 congestionScore = factors.networkCongestion < 50 ? 100 : (5000 / (factors.networkCongestion + 50));
        
        // Historical success score
        uint256 historyScore = factors.historicalSuccess;
        
        // Timing score (prefer certain hours)
        uint256 timingScore = _getTimingScore(factors.timeOfDay);
        
        // Market condition score
        uint256 marketScore = factors.marketCondition;
        
        // Weighted average
        score = (
            spreadScore * weights.spreadWeight +
            liquidityScore * weights.liquidityWeight +
            volatilityScore * weights.volatilityWeight +
            gasScore * weights.gasPriceWeight +
            congestionScore * weights.congestionWeight +
            historyScore * weights.historyWeight +
            timingScore * weights.timingWeight +
            marketScore * weights.marketWeight
        ) / 100;
    }
    
    /**
     * @dev Apply agent profile adjustments to base score
     */
    function _applyProfileAdjustments(
        uint256 baseScore,
        DecisionFactors memory factors,
        AgentProfile memory profile
    ) internal pure returns (uint256 adjustedScore) {
        adjustedScore = baseScore;
        
        // Risk tolerance adjustment
        if (profile.riskTolerance > 70) {
            adjustedScore = (adjustedScore * 110) / 100; // +10% for high risk tolerance
        } else if (profile.riskTolerance < 30) {
            adjustedScore = (adjustedScore * 90) / 100; // -10% for low risk tolerance
        }
        
        // Gas price preference
        if (factors.gasPrice > profile.maxGasPrice) {
            adjustedScore = (adjustedScore * 80) / 100; // -20% for high gas
        }
        
        // Ensure score doesn't exceed 100
        if (adjustedScore > 100) adjustedScore = 100;
    }
    
    /**
     * @dev Calculate risk score for the opportunity
     */
    function _calculateRiskScore(
        DecisionFactors memory factors,
        AgentProfile memory profile
    ) internal pure returns (uint256 riskScore) {
        riskScore = 0;
        
        // High volatility increases risk
        if (factors.volatility > 200) riskScore += 30;
        else if (factors.volatility > 100) riskScore += 15;
        
        // Low liquidity increases risk
        if (factors.liquidity < 100000) riskScore += 25;
        else if (factors.liquidity < 500000) riskScore += 10;
        
        // High gas price increases risk
        if (factors.gasPrice > 100 gwei) riskScore += 20;
        else if (factors.gasPrice > 50 gwei) riskScore += 10;
        
        // Network congestion increases risk
        if (factors.networkCongestion > 80) riskScore += 15;
        else if (factors.networkCongestion > 60) riskScore += 8;
        
        // Low historical success increases risk
        if (factors.historicalSuccess < 50) riskScore += 20;
        else if (factors.historicalSuccess < 70) riskScore += 10;
        
        // Ensure risk score doesn't exceed 100
        if (riskScore > 100) riskScore = 100;
    }
    
    // Helper functions (simplified implementations)
    function _estimateLiquidity(address dexA, address dexB) internal pure returns (uint256) {
        // Simplified liquidity estimation
        return 500000; // $500k default
    }
    
    function _getVolatility(address tokenA, address tokenB) internal pure returns (uint256) {
        // Simplified volatility calculation
        return 150; // 1.5% default
    }
    
    function _getNetworkCongestion() internal view returns (uint256) {
        // Simplified network congestion based on gas price
        if (tx.gasprice > 100 gwei) return 90;
        if (tx.gasprice > 50 gwei) return 60;
        if (tx.gasprice > 20 gwei) return 30;
        return 10;
    }
    
    function _getHistoricalSuccess(address agent) internal view returns (uint256) {
        AgentProfile memory profile = agentProfiles[agent];
        if (profile.totalDecisions == 0) return 50; // Default for new agents
        return (profile.successfulDecisions * 100) / profile.totalDecisions;
    }
    
    function _getTimingScore(uint256 hourOfDay) internal pure returns (uint256) {
        // Prefer trading during active market hours (simplified)
        if (hourOfDay >= 8 && hourOfDay <= 20) return 100; // 8 AM - 8 PM
        if (hourOfDay >= 6 && hourOfDay <= 22) return 80;  // 6 AM - 10 PM
        return 50; // Night hours
    }
    
    function _getMarketCondition() internal pure returns (uint256) {
        // Simplified market condition (would integrate with market data)
        return 75; // Neutral market
    }
    
    /**
     * @dev Update agent profile
     */
    function updateAgentProfile(
        uint256 riskTolerance,
        uint256 minProfitThreshold,
        uint256 maxGasPrice,
        uint256 preferredTimeSlots
    ) external onlyAuthorizedAgent {
        require(riskTolerance <= 100, "Invalid risk tolerance");
        
        AgentProfile storage profile = agentProfiles[msg.sender];
        profile.riskTolerance = riskTolerance;
        profile.minProfitThreshold = minProfitThreshold;
        profile.maxGasPrice = maxGasPrice;
        profile.preferredTimeSlots = preferredTimeSlots;
        
        emit AgentProfileUpdated(msg.sender, riskTolerance, minProfitThreshold);
    }
    
    /**
     * @dev Record successful execution
     */
    function recordSuccess(address agent, uint256 profit) external {
        require(msg.sender == address(decisionRegistry), "Only registry can record");
        
        AgentProfile storage profile = agentProfiles[agent];
        profile.successfulDecisions++;
        profile.totalProfit += profit;
    }
    
    // Admin functions
    function addAuthorizedAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = true;
        
        // Set default profile
        agentProfiles[agent] = AgentProfile({
            riskTolerance: 50,
            minProfitThreshold: 50, // $50
            maxGasPrice: 30 gwei,
            preferredTimeSlots: 0xFFFFFFFFFFFFFFFF,
            isActive: true,
            totalDecisions: 0,
            successfulDecisions: 0,
            totalProfit: 0
        });
    }
    
    function updateDecisionWeights(DecisionWeights calldata newWeights) external onlyOwner {
        require(
            newWeights.spreadWeight + newWeights.liquidityWeight + 
            newWeights.volatilityWeight + newWeights.gasPriceWeight +
            newWeights.congestionWeight + newWeights.historyWeight +
            newWeights.timingWeight + newWeights.marketWeight == 100,
            "Weights must sum to 100"
        );
        
        defaultWeights = newWeights;
    }
    
    function setMinSpreadThreshold(uint256 threshold) external onlyOwner {
        minSpreadThreshold = threshold;
    }
    
    function setMaxRiskScore(uint256 maxRisk) external onlyOwner {
        require(maxRisk <= 100, "Invalid max risk");
        maxRiskScore = maxRisk;
    }
}
