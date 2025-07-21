// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../utils/ERC20Safe.sol";
import "./AccessControl.sol";

/**
 * @title Vault
 * @dev Treasury vault for managing arbitrage profits
 */
contract Vault is AccessControl {
    using ERC20Safe for IERC20;
    
    struct VaultBalance {
        uint256 totalDeposits;
        uint256 totalWithdrawals;
        uint256 totalProfits;
        uint256 totalFees;
        uint256 lastUpdate;
    }
    
    struct WithdrawalRequest {
        address requester;
        uint256 amount;
        uint256 timestamp;
        bool approved;
        bool executed;
    }
    
    mapping(address => VaultBalance) public tokenBalances;
    mapping(uint256 => WithdrawalRequest) public withdrawalRequests;
    mapping(address => bool) public authorizedAgents;
    
    uint256 public nextRequestId = 1;
    uint256 public withdrawalDelay = 24 hours;
    uint256 public maxWithdrawalPercentage = 1000; // 10% in basis points
    
    event ProfitDeposited(address indexed token, uint256 amount, address indexed agent);
    event WithdrawalRequested(uint256 indexed requestId, address indexed requester, uint256 amount);
    event WithdrawalExecuted(uint256 indexed requestId, address indexed requester, uint256 amount);
    event EmergencyWithdrawal(address indexed token, uint256 amount, address indexed to);
    
    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender], "Not authorized agent");
        _;
    }
    
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(AGENT_ROLE, msg.sender);
        authorizedAgents[msg.sender] = true;
    }
    
    /**
     * @dev Deposit profits from arbitrage
     */
    function depositProfit(address token, uint256 amount) 
        external 
        onlyAuthorizedAgent 
    {
        require(amount > 0, "Invalid amount");
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        
        VaultBalance storage balance = tokenBalances[token];
        balance.totalProfits += amount;
        balance.lastUpdate = block.timestamp;
        
        emit ProfitDeposited(token, amount, msg.sender);
    }
    
    /**
     * @dev Request withdrawal from vault
     */
    function requestWithdrawal(address token, uint256 amount) 
        external 
        onlyRole(TREASURY_MANAGER_ROLE) 
        returns (uint256 requestId) 
    {
        require(amount > 0, "Invalid amount");
        
        uint256 availableBalance = IERC20(token).balanceOf(address(this));
        uint256 maxWithdrawal = (availableBalance * maxWithdrawalPercentage) / 10000;
        
        require(amount <= maxWithdrawal, "Exceeds max withdrawal");
        
        requestId = nextRequestId++;
        
        withdrawalRequests[requestId] = WithdrawalRequest({
            requester: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            approved: false,
            executed: false
        });
        
        emit WithdrawalRequested(requestId, msg.sender, amount);
    }
    
    /**
     * @dev Approve withdrawal request
     */
    function approveWithdrawal(uint256 requestId) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(request.requester != address(0), "Invalid request");
        require(!request.approved, "Already approved");
        
        request.approved = true;
    }
    
    /**
     * @dev Execute approved withdrawal
     */
    function executeWithdrawal(uint256 requestId, address token) 
        external 
    {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(request.requester == msg.sender, "Not requester");
        require(request.approved, "Not approved");
        require(!request.executed, "Already executed");
        require(
            block.timestamp >= request.timestamp + withdrawalDelay,
            "Withdrawal delay not met"
        );
        
        request.executed = true;
        
        VaultBalance storage balance = tokenBalances[token];
        balance.totalWithdrawals += request.amount;
        balance.lastUpdate = block.timestamp;
        
        IERC20(token).safeTransfer(request.requester, request.amount);
        
        emit WithdrawalExecuted(requestId, request.requester, request.amount);
    }
    
    /**
     * @dev Emergency withdrawal (admin only)
     */
    function emergencyWithdraw(address token, uint256 amount, address to) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(amount > 0, "Invalid amount");
        require(to != address(0), "Invalid recipient");
        
        IERC20(token).safeTransfer(to, amount);
        
        emit EmergencyWithdrawal(token, amount, to);
    }
    
    /**
     * @dev Get vault statistics
     */
    function getVaultStats(address token) 
        external 
        view 
        returns (
            uint256 currentBalance,
            uint256 totalProfits,
            uint256 totalWithdrawals,
            uint256 netProfit,
            uint256 lastUpdate
        ) 
    {
        VaultBalance memory balance = tokenBalances[token];
        currentBalance = IERC20(token).balanceOf(address(this));
        totalProfits = balance.totalProfits;
        totalWithdrawals = balance.totalWithdrawals;
        netProfit = totalProfits > totalWithdrawals ? totalProfits - totalWithdrawals : 0;
        lastUpdate = balance.lastUpdate;
    }
    
    /**
     * @dev Get withdrawal request details
     */
    function getWithdrawalRequest(uint256 requestId) 
        external 
        view 
        returns (WithdrawalRequest memory) 
    {
        return withdrawalRequests[requestId];
    }
    
    // Admin functions
    function addAuthorizedAgent(address agent) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        authorizedAgents[agent] = true;
        _setupRole(AGENT_ROLE, agent);
    }
    
    function setWithdrawalDelay(uint256 delay) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        withdrawalDelay = delay;
    }
    
    function setMaxWithdrawalPercentage(uint256 percentage) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        require(percentage <= 5000, "Max 50%"); // Max 50%
        maxWithdrawalPercentage = percentage;
    }
}
