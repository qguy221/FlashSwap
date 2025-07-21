// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FlashSwapArbAgent.sol";

contract FlashSwapVault is ERC4626, Ownable {
    FlashSwapArbAgent public arbAgent;
    uint256 public feePercentage = 25; // 0.25%

    constructor(IERC20 asset, string memory name_, string memory symbol_, FlashSwapArbAgent _arbAgent) ERC4626(asset) ERC20(name_, symbol_) Ownable(msg.sender) {
        arbAgent = _arbAgent;
    }

    function deposit(uint256 assets, address receiver) public override returns (uint256) {
        uint256 shares = super.deposit(assets, receiver);
        // Additional logic if needed
        return shares;
    }

    function withdraw(uint256 assets, address receiver, address owner) public override returns (uint256) {
        uint256 shares = super.withdraw(assets, receiver, owner);
        // Additional logic
        return shares;
    }

    function executeArbitrage(FlashSwapArbAgent.ArbitrageParams calldata params) external onlyOwner {
        // Approve assets to arbAgent
        IERC20(asset()).approve(address(arbAgent), params.amount);
        arbAgent.executeArbitrage(params);
        // Collect fees
        uint256 profit = IERC20(asset()).balanceOf(address(this)) - totalAssets();
        uint256 fee = (profit * feePercentage) / 10000;
        IERC20(asset()).transfer(owner(), fee);
    }

    function setFeePercentage(uint256 newFee) external onlyOwner {
        feePercentage = newFee;
    }
}