// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IRouterA
 * @dev Interface for DEX Router A (e.g., SeiSwap)
 */
interface IRouterA {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
    
    function getAmountsIn(uint amountOut, address[] calldata path)
        external view returns (uint[] memory amounts);
    
    function quote(uint amountA, uint reserveA, uint reserveB)
        external pure returns (uint amountB);
    
    function getReserves(address tokenA, address tokenB)
        external view returns (uint reserveA, uint reserveB, uint32 blockTimestampLast);
}
