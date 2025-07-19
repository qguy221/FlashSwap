// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IFlashLoanProvider.sol";
import "./interfaces/IDex.sol";
import "./interfaces/IVault.sol";

contract FlashSwapArbAgent is Ownable, ReentrancyGuard {
    address public flashLoanProvider;
    address public aiAgent;
    mapping(address => bool) public dexWhitelist;
    mapping(address => bool) public vaultWhitelist;
    uint256 public minProfitThreshold;
    uint256 public maxSlippage;

    struct ArbitrageParams {
        address tokenIn;
        address tokenOut;
        uint256 amount;
        address dexBuy;
        address dexSell;
        uint256 expectedProfit;
    }

    struct YieldParams {
        address fromVault;
        address toVault;
        uint256 amount;
    }

    constructor(address _flashLoanProvider, address _aiAgent) Ownable(msg.sender) {
        flashLoanProvider = _flashLoanProvider;
        aiAgent = _aiAgent;
        minProfitThreshold = 0.01 ether; // Example value
        maxSlippage = 500; // 0.5%
    }

    modifier onlyAIAgent() {
        require(msg.sender == aiAgent, "Only AI agent can call");
        _;
    }

    function executeArbitrage(ArbitrageParams calldata params) external onlyAIAgent nonReentrant {
        // Check profit and slippage
        require(params.expectedProfit >= minProfitThreshold, "Profit too low");
        // Additional checks...

        // Request flash loan
        bytes memory data = abi.encode(params);
        IFlashLoanProvider(flashLoanProvider).flashLoan(address(this), params.tokenIn, params.amount, data);
    }

    function executeOperation(
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external {
        require(msg.sender == flashLoanProvider, "Unauthorized");
        ArbitrageParams memory params = abi.decode(data, (ArbitrageParams));

        // Execute buy on dexBuy
        IERC20(token).approve(params.dexBuy, amount);
        IDex(params.dexBuy).swap(token, params.tokenOut, amount);

        // Execute sell on dexSell
        uint256 outBalance = IERC20(params.tokenOut).balanceOf(address(this));
        IERC20(params.tokenOut).approve(params.dexSell, outBalance);
        IDex(params.dexSell).swap(params.tokenOut, token, outBalance);

        // Repay loan
        uint256 repayAmount = amount + fee;
        IERC20(token).transfer(flashLoanProvider, repayAmount);

        // Log profit
        uint256 profit = IERC20(token).balanceOf(address(this));
        require(profit >= params.expectedProfit, "Profit mismatch");
        // Transfer profit to owner or vault
    }

    function optimizeYield(YieldParams calldata params) external onlyAIAgent nonReentrant {
        require(vaultWhitelist[params.fromVault], "Vault not whitelisted");
        require(vaultWhitelist[params.toVault], "Vault not whitelisted");

        // Withdraw from fromVault
        IVault(params.fromVault).withdraw(params.amount);

        // Deposit to toVault
        address token = IVault(params.toVault).underlyingToken();
        IERC20(token).approve(params.toVault, params.amount);
        IVault(params.toVault).deposit(params.amount);
    }

    // Admin functions
    function addDexToWhitelist(address dex) external onlyOwner {
        dexWhitelist[dex] = true;
    }

    function addVaultToWhitelist(address vault) external onlyOwner {
        vaultWhitelist[vault] = true;
    }

    function setMinProfitThreshold(uint256 threshold) external onlyOwner {
        minProfitThreshold = threshold;
    }

    function setMaxSlippage(uint256 slippage) external onlyOwner {
        maxSlippage = slippage;
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }

    // Add event for logging
     event ArbitrageExecuted(address tokenIn, address tokenOut, uint256 profit);
    
    // In executeOperation, after calculating profit
     emit ArbitrageExecuted(params.tokenIn, params.tokenOut, profit);
    
    // Add gas limit check
     require(gasleft() > 100000, "Insufficient gas");
}

    function optimizeYield(YieldParams calldata params) external onlyAIAgent nonReentrant {
        require(vaultWhitelist[params.fromVault], "Vault not whitelisted");
        require(vaultWhitelist[params.toVault], "Vault not whitelisted");

        // Withdraw from fromVault
        IVault(params.fromVault).withdraw(params.amount);

        // Deposit to toVault
        address token = IVault(params.toVault).underlyingToken();
        IERC20(token).approve(params.toVault, params.amount);
        IVault(params.toVault).deposit(params.amount);
    }

    // Admin functions
    function addDexToWhitelist(address dex) external onlyOwner {
        dexWhitelist[dex] = true;
    }

    function addVaultToWhitelist(address vault) external onlyOwner {
        vaultWhitelist[vault] = true;
    }

    function setMinProfitThreshold(uint256 threshold) external onlyOwner {
        minProfitThreshold = threshold;
    }

    function setMaxSlippage(uint256 slippage) external onlyOwner {
        maxSlippage = slippage;
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}

    // Update optimizeYield to include fee calculation or something for realism
    function optimizeYield(YieldParams calldata params) external onlyAIAgent nonReentrant {
        require(vaultWhitelist[params.fromVault], "Vault not whitelisted");
        require(vaultWhitelist[params.toVault], "Vault not whitelisted");

        // Withdraw from fromVault
        IVault(params.fromVault).withdraw(params.amount);

        // Deposit to toVault
        address token = IVault(params.toVault).underlyingToken();
        IERC20(token).approve(params.toVault, params.amount);
        IVault(params.toVault).deposit(params.amount);
    }

    // Admin functions
    function addDexToWhitelist(address dex) external onlyOwner {
        dexWhitelist[dex] = true;
    }

    function addVaultToWhitelist(address vault) external onlyOwner {
        vaultWhitelist[vault] = true;
    }

    function setMinProfitThreshold(uint256 threshold) external onlyOwner {
        minProfitThreshold = threshold;
    }

    function setMaxSlippage(uint256 slippage) external onlyOwner {
        maxSlippage = slippage;
    }

    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}