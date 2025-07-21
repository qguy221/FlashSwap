// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPriceFeed
 * @dev Interface for price feed oracles
 */
interface IPriceFeed {
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        uint256 confidence;
        bool isValid;
    }
    
    /**
     * @dev Get latest price for token pair
     */
    function getLatestPrice(address tokenA, address tokenB) 
        external 
        view 
        returns (PriceData memory);
    
    /**
     * @dev Get historical price data
     */
    function getHistoricalPrice(
        address tokenA, 
        address tokenB, 
        uint256 timestamp
    ) external view returns (PriceData memory);
    
    /**
     * @dev Check if price feed is active
     */
    function isActive(address tokenA, address tokenB) 
        external 
        view 
        returns (bool);
    
    /**
     * @dev Get price feed metadata
     */
    function getFeedInfo(address tokenA, address tokenB) 
        external 
        view 
        returns (
            string memory source,
            uint256 updateFrequency,
            uint256 lastUpdate
        );
}
