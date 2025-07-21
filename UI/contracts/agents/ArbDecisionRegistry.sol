// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ArbDecisionRegistry
 * @dev Registry for storing and tracking arbitrage decisions
 */
contract ArbDecisionRegistry {
    enum DecisionType { EXECUTE, SKIP, MONITOR, RETRY }
    
    struct Decision {
        uint256 id;
        address agent;
        address tokenA;
        address tokenB;
        address dexA;
        address dexB;
        DecisionType decision;
        uint256 confidence;
        string reasoning;
        uint256 expectedProfit;
        uint256 riskScore;
        uint256 timestamp;
        bool executed;
        uint256 actualProfit;
    }
    
    struct AgentStats {
        uint256 totalDecisions;
        uint256 executedTrades;
        uint256 successfulTrades;
        uint256 totalProfit;
        uint256 totalLoss;
        uint256 averageConfidence;
        uint256 lastActivity;
    }
    
    mapping(uint256 => Decision) public decisions;
    mapping(address => AgentStats) public agentStats;
    mapping(address => bool) public authorizedAgents;
    mapping(address => uint256[]) public agentDecisions;
    
    uint256 public nextDecisionId = 1;
    address public owner;
    
    event DecisionRecorded(
        uint256 indexed decisionId,
        address indexed agent,
        DecisionType decision,
        uint256 confidence,
        string reasoning
    );
    
    event DecisionExecuted(
        uint256 indexed decisionId,
        bool success,
        uint256 actualProfit
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender], "Not authorized agent");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedAgents[msg.sender] = true;
    }
    
    /**
     * @dev Record a new arbitrage decision
     */
    function recordDecision(
        address tokenA,
        address tokenB,
        address dexA,
        address dexB,
        DecisionType decision,
        uint256 confidence,
        string calldata reasoning,
        uint256 expectedProfit,
        uint256 riskScore
    ) external onlyAuthorizedAgent returns (uint256 decisionId) {
        decisionId = nextDecisionId++;
        
        decisions[decisionId] = Decision({
            id: decisionId,
            agent: msg.sender,
            tokenA: tokenA,
            tokenB: tokenB,
            dexA: dexA,
            dexB: dexB,
            decision: decision,
            confidence: confidence,
            reasoning: reasoning,
            expectedProfit: expectedProfit,
            riskScore: riskScore,
            timestamp: block.timestamp,
            executed: false,
            actualProfit: 0
        });
        
        agentDecisions[msg.sender].push(decisionId);
        
        // Update agent stats
        AgentStats storage stats = agentStats[msg.sender];
        stats.totalDecisions++;
        stats.averageConfidence = (stats.averageConfidence * (stats.totalDecisions - 1) + confidence) / stats.totalDecisions;
        stats.lastActivity = block.timestamp;
        
        emit DecisionRecorded(decisionId, msg.sender, decision, confidence, reasoning);
    }
    
    /**
     * @dev Record execution result
     */
    function recordExecution(
        uint256 decisionId,
        bool success,
        uint256 actualProfit
    ) external onlyAuthorizedAgent {
        Decision storage decision = decisions[decisionId];
        require(decision.agent == msg.sender, "Not decision owner");
        require(!decision.executed, "Already executed");
        
        decision.executed = true;
        decision.actualProfit = actualProfit;
        
        // Update agent stats
        AgentStats storage stats = agentStats[msg.sender];
        stats.executedTrades++;
        
        if (success) {
            stats.successfulTrades++;
            stats.totalProfit += actualProfit;
        } else {
            stats.totalLoss += actualProfit; // actualProfit would be negative/loss
        }
        
        emit DecisionExecuted(decisionId, success, actualProfit);
    }
    
    /**
     * @dev Get agent performance metrics
     */
    function getAgentPerformance(address agent) 
        external 
        view 
        returns (
            uint256 successRate,
            uint256 profitLossRatio,
            uint256 averageProfit,
            uint256 totalDecisions,
            uint256 executedTrades
        ) 
    {
        AgentStats memory stats = agentStats[agent];
        
        successRate = stats.executedTrades > 0 
            ? (stats.successfulTrades * 100) / stats.executedTrades 
            : 0;
            
        profitLossRatio = stats.totalLoss > 0 
            ? (stats.totalProfit * 100) / stats.totalLoss 
            : (stats.totalProfit > 0 ? type(uint256).max : 0);
            
        averageProfit = stats.successfulTrades > 0 
            ? stats.totalProfit / stats.successfulTrades 
            : 0;
            
        totalDecisions = stats.totalDecisions;
        executedTrades = stats.executedTrades;
    }
    
    /**
     * @dev Get recent decisions for agent
     */
    function getRecentDecisions(address agent, uint256 limit) 
        external 
        view 
        returns (Decision[] memory) 
    {
        uint256[] memory decisionIds = agentDecisions[agent];
        uint256 length = decisionIds.length;
        uint256 returnLength = length > limit ? limit : length;
        
        Decision[] memory recentDecisions = new Decision[](returnLength);
        
        for (uint256 i = 0; i < returnLength; i++) {
            uint256 index = length - 1 - i; // Get most recent first
            recentDecisions[i] = decisions[decisionIds[index]];
        }
        
        return recentDecisions;
    }
    
    /**
     * @dev Get decision by ID
     */
    function getDecision(uint256 decisionId) 
        external 
        view 
        returns (Decision memory) 
    {
        return decisions[decisionId];
    }
    
    // Admin functions
    function addAuthorizedAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = true;
    }
    
    function removeAuthorizedAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = false;
    }
}
