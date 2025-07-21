// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IRouterB
 * @dev Interface for DEX Router B (e.g., Vortex)
 */
interface IRouterB {
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut);
    
    function getQuote(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 amountOut, uint256 priceImpact);
    
    function getPoolInfo(address tokenA, address tokenB)
        external view returns (
            uint256 reserveA,
            uint256 reserveB,
            uint256 totalSupply,
            uint256 fee
        );
}
