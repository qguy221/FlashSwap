// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IPriceFeed.sol";

/**
 * @title PriceFeedOracle
 * @dev Oracle for fetching real-time price data from multiple sources
 */
contract PriceFeedOracle is IPriceFeed {
    struct PriceFeedData {
        uint256 price;
        uint256 timestamp;
        uint256 confidence;
        bool isActive;
        string source;
        uint256 updateFrequency;
    }
    
    mapping(bytes32 => PriceFeedData) public priceFeeds;
    mapping(address => bool) public authorizedUpdaters;
    mapping(bytes32 => uint256[]) public priceHistory;
    
    address public owner;
    uint256 public maxPriceAge = 300; // 5 minutes
    uint256 public minConfidence = 80; // 80%
    
    event PriceUpdated(
        address indexed tokenA,
        address indexed tokenB,
        uint256 price,
        uint256 confidence,
        string source
    );
    
    event OracleStatusChanged(
        address indexed tokenA,
        address indexed tokenB,
        bool isActive
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyAuthorizedUpdater() {
        require(authorizedUpdaters[msg.sender], "Not authorized updater");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedUpdaters[msg.sender] = true;
    }
    
    /**
     * @dev Get latest price for token pair
     */
    function getLatestPrice(address tokenA, address tokenB) 
        external 
        view 
        override
        returns (PriceData memory) 
    {
        bytes32 feedId = _getFeedId(tokenA, tokenB);
        PriceFeedData memory feed = priceFeeds[feedId];
        
        bool isValid = feed.isActive && 
                      (block.timestamp - feed.timestamp) <= maxPriceAge &&
                      feed.confidence >= minConfidence;
        
        return PriceData({
            price: feed.price,
            timestamp: feed.timestamp,
            confidence: feed.confidence,
            isValid: isValid
        });
    }
    
    /**
     * @dev Update price data
     */
    function updatePrice(
        address tokenA,
        address tokenB,
        uint256 price,
        uint256 confidence,
        string calldata source
    ) external onlyAuthorizedUpdater {
        require(price > 0, "Invalid price");
        require(confidence <= 100, "Invalid confidence");
        
        bytes32 feedId = _getFeedId(tokenA, tokenB);
        
        priceFeeds[feedId] = PriceFeedData({
            price: price,
            timestamp: block.timestamp,
            confidence: confidence,
            isActive: true,
            source: source,
            updateFrequency: 60 // 1 minute default
        });
        
        // Store in history
        priceHistory[feedId].push(price);
        
        // Keep only last 100 prices
        if (priceHistory[feedId].length > 100) {
            for (uint256 i = 0; i < priceHistory[feedId].length - 1; i++) {
                priceHistory[feedId][i] = priceHistory[feedId][i + 1];
            }
            priceHistory[feedId].pop();
        }
        
        emit PriceUpdated(tokenA, tokenB, price, confidence, source);
    }
    
    /**
     * @dev Batch update multiple prices
     */
    function batchUpdatePrices(
        address[] calldata tokensA,
        address[] calldata tokensB,
        uint256[] calldata prices,
        uint256[] calldata confidences,
        string[] calldata sources
    ) external onlyAuthorizedUpdater {
        require(
            tokensA.length == tokensB.length &&
            tokensB.length == prices.length &&
            prices.length == confidences.length &&
            confidences.length == sources.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < tokensA.length; i++) {
            this.updatePrice(tokensA[i], tokensB[i], prices[i], confidences[i], sources[i]);
        }
    }
    
    /**
     * @dev Get historical price data
     */
    function getHistoricalPrice(
        address tokenA, 
        address tokenB, 
        uint256 timestamp
    ) external view override returns (PriceData memory) {
        bytes32 feedId = _getFeedId(tokenA, tokenB);
        PriceFeedData memory feed = priceFeeds[feedId];
        
        // For simplicity, return current price if timestamp is recent
        // In production, this would search through historical data
        bool isValid = feed.isActive && 
                      timestamp <= block.timestamp &&
                      (block.timestamp - timestamp) <= maxPriceAge * 10; // Allow older data for historical
        
        return PriceData({
            price: feed.price,
            timestamp: feed.timestamp,
            confidence: feed.confidence,
            isValid: isValid
        });
    }
    
    /**
     * @dev Check if price feed is active
     */
    function isActive(address tokenA, address tokenB) 
        external 
        view 
        override
        returns (bool) 
    {
        bytes32 feedId = _getFeedId(tokenA, tokenB);
        PriceFeedData memory feed = priceFeeds[feedId];
        
        return feed.isActive && 
               (block.timestamp - feed.timestamp) <= maxPriceAge &&
               feed.confidence >= minConfidence;
    }
    
    /**
     * @dev Get price feed metadata
     */
    function getFeedInfo(address tokenA, address tokenB) 
        external 
        view 
        override
        returns (
            string memory source,
            uint256 updateFrequency,
            uint256 lastUpdate
        ) 
    {
        bytes32 feedId = _getFeedId(tokenA, tokenB);
        PriceFeedData memory feed = priceFeeds[feedId];
        
        return (feed.source, feed.updateFrequency, feed.timestamp);
    }
    
    /**
     * @dev Get price volatility (standard deviation of last 10 prices)
     */
    function getPriceVolatility(address tokenA, address tokenB) 
        external 
        view 
        returns (uint256 volatility) 
    {
        bytes32 feedId = _getFeedId(tokenA, tokenB);
        uint256[] memory history = priceHistory[feedId];
        
        if (history.length < 2) return 0;
        
        uint256 length = history.length > 10 ? 10 : history.length;
        uint256 sum = 0;
        
        // Calculate mean
        for (uint256 i = history.length - length; i < history.length; i++) {
            sum += history[i];
        }
        uint256 mean = sum / length;
        
        // Calculate variance
        uint256 variance = 0;
        for (uint256 i = history.length - length; i < history.length; i++) {
            uint256 diff = history[i] > mean ? history[i] - mean : mean - history[i];
            variance += (diff * diff);
        }
        variance = variance / length;
        
        // Return square root of variance (approximation)
        volatility = _sqrt(variance);
    }
    
    /**
     * @dev Generate feed ID for token pair
     */
    function _getFeedId(address tokenA, address tokenB) 
        internal 
        pure 
        returns (bytes32) 
    {
        return keccak256(abi.encodePacked(tokenA, tokenB));
    }
    
    /**
     * @dev Square root approximation
     */
    function _sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
    
    // Admin functions
    function addAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = true;
    }
    
    function removeAuthorizedUpdater(address updater) external onlyOwner {
        authorizedUpdaters[updater] = false;
    }
    
    function setMaxPriceAge(uint256 age) external onlyOwner {
        maxPriceAge = age;
    }
    
    function setMinConfidence(uint256 confidence) external onlyOwner {
        require(confidence <= 100, "Invalid confidence");
        minConfidence = confidence;
    }
    
    function toggleFeedStatus(address tokenA, address tokenB, bool status) 
        external 
        onlyOwner 
    {
        bytes32 feedId = _getFeedId(tokenA, tokenB);
        priceFeeds[feedId].isActive = status;
        
        emit OracleStatusChanged(tokenA, tokenB, status);
    }
}
