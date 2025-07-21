// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IPriceFeed.sol";
import "../utils/SpreadLib.sol";

/**
 * @title PoolScanner
 * @dev Scans multiple DEX pools for arbitrage opportunities
 * @notice This contract is part of FlashArb.AI autonomous arbitrage system
 */
contract PoolScanner {
    using SpreadLib for uint256;
    
    struct PoolData {
        address dexRouter;
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 price;
        uint256 liquidity;
        uint256 lastUpdate;
    }
    
    struct ArbitrageOpportunity {
        address tokenA;
        address tokenB;
        address dexA;
        address dexB;
        uint256 priceA;
        uint256 priceB;
        uint256 spread;
        uint256 profitPotential;
        uint256 confidence;
        bool isValid;
    }
    
    mapping(bytes32 => PoolData) public pools;
    mapping(address => bool) public authorizedDEXs;
    mapping(address => bool) public authorizedAgents;
    
    address public owner;
    uint256 public minSpreadThreshold = 100; // 1% in basis points
    uint256 public maxAge = 300; // 5 minutes
    
    event OpportunityDetected(
        address indexed tokenA,
        address indexed tokenB,
        address dexA,
        address dexB,
        uint256 spread,
        uint256 profitPotential
    );
    
    event PoolUpdated(
        bytes32 indexed poolId,
        address indexed dex,
        uint256 price,
        uint256 liquidity
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
     * @dev Update pool data from DEX
     */
    function updatePool(
        address dexRouter,
        address tokenA,
        address tokenB,
        uint256 reserveA,
        uint256 reserveB
    ) external onlyAuthorizedAgent {
        bytes32 poolId = keccak256(abi.encodePacked(dexRouter, tokenA, tokenB));
        
        uint256 price = (reserveB * 1e18) / reserveA;
        uint256 liquidity = reserveA + reserveB;
        
        pools[poolId] = PoolData({
            dexRouter: dexRouter,
            tokenA: tokenA,
            tokenB: tokenB,
            reserveA: reserveA,
            reserveB: reserveB,
            price: price,
            liquidity: liquidity,
            lastUpdate: block.timestamp
        });
        
        emit PoolUpdated(poolId, dexRouter, price, liquidity);
    }
    
    /**
     * @dev Scan for arbitrage opportunities between two DEXs
     */
    function scanArbitrageOpportunity(
        address tokenA,
        address tokenB,
        address dexA,
        address dexB
    ) external view returns (ArbitrageOpportunity memory) {
        bytes32 poolIdA = keccak256(abi.encodePacked(dexA, tokenA, tokenB));
        bytes32 poolIdB = keccak256(abi.encodePacked(dexB, tokenA, tokenB));
        
        PoolData memory poolA = pools[poolIdA];
        PoolData memory poolB = pools[poolIdB];
        
        // Check if data is fresh
        bool isValidA = (block.timestamp - poolA.lastUpdate) <= maxAge;
        bool isValidB = (block.timestamp - poolB.lastUpdate) <= maxAge;
        
        if (!isValidA || !isValidB) {
            return ArbitrageOpportunity({
                tokenA: tokenA,
                tokenB: tokenB,
                dexA: dexA,
                dexB: dexB,
                priceA: 0,
                priceB: 0,
                spread: 0,
                profitPotential: 0,
                confidence: 0,
                isValid: false
            });
        }
        
        uint256 spread = poolA.price.calculateSpread(poolB.price);
        uint256 profitPotential = _calculateProfitPotential(
            poolA.price,
            poolB.price,
            poolA.liquidity,
            poolB.liquidity
        );
        
        uint256 confidence = _calculateConfidence(
            spread,
            poolA.liquidity,
            poolB.liquidity
        );
        
        return ArbitrageOpportunity({
            tokenA: tokenA,
            tokenB: tokenB,
            dexA: dexA,
            dexB: dexB,
            priceA: poolA.price,
            priceB: poolB.price,
            spread: spread,
            profitPotential: profitPotential,
            confidence: confidence,
            isValid: spread >= minSpreadThreshold
        });
    }
    
    /**
     * @dev Calculate profit potential for arbitrage
     */
    function _calculateProfitPotential(
        uint256 priceA,
        uint256 priceB,
        uint256 liquidityA,
        uint256 liquidityB
    ) internal pure returns (uint256) {
        uint256 spread = priceA > priceB ? priceA - priceB : priceB - priceA;
        uint256 minLiquidity = liquidityA < liquidityB ? liquidityA : liquidityB;
        
        // Simple profit calculation: spread * available liquidity * efficiency factor
        return (spread * minLiquidity * 80) / (100 * 1e18); // 80% efficiency
    }
    
    /**
     * @dev Calculate confidence score for opportunity
     */
    function _calculateConfidence(
        uint256 spread,
        uint256 liquidityA,
        uint256 liquidityB
    ) internal view returns (uint256) {
        uint256 baseConfidence = 50;
        
        // Higher spread = higher confidence
        if (spread > 200) baseConfidence += 30; // >2%
        else if (spread > 100) baseConfidence += 20; // >1%
        else if (spread > 50) baseConfidence += 10; // >0.5%
        
        // Higher liquidity = higher confidence
        uint256 minLiquidity = liquidityA < liquidityB ? liquidityA : liquidityB;
        if (minLiquidity > 1000000 * 1e18) baseConfidence += 20;
        else if (minLiquidity > 500000 * 1e18) baseConfidence += 10;
        
        return baseConfidence > 100 ? 100 : baseConfidence;
    }
    
    /**
     * @dev Batch scan multiple opportunities
     */
    function batchScanOpportunities(
        address[] calldata tokensA,
        address[] calldata tokensB,
        address[] calldata dexsA,
        address[] calldata dexsB
    ) external view returns (ArbitrageOpportunity[] memory) {
        require(
            tokensA.length == tokensB.length &&
            tokensB.length == dexsA.length &&
            dexsA.length == dexsB.length,
            "Array length mismatch"
        );
        
        ArbitrageOpportunity[] memory opportunities = new ArbitrageOpportunity[](tokensA.length);
        
        for (uint256 i = 0; i < tokensA.length; i++) {
            opportunities[i] = this.scanArbitrageOpportunity(
                tokensA[i],
                tokensB[i],
                dexsA[i],
                dexsB[i]
            );
        }
        
        return opportunities;
    }
    
    // Admin functions
    function addAuthorizedDEX(address dex) external onlyOwner {
        authorizedDEXs[dex] = true;
    }
    
    function addAuthorizedAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = true;
    }
    
    function setMinSpreadThreshold(uint256 threshold) external onlyOwner {
        minSpreadThreshold = threshold;
    }
    
    function setMaxAge(uint256 age) external onlyOwner {
        maxAge = age;
    }
}
