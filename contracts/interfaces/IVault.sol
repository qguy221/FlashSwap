// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

interface IVault {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
    function underlyingToken() external view returns (address);
}