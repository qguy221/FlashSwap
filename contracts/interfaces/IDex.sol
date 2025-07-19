// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IDex {
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut);
}