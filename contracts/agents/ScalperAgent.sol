// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./ArbDecisionEngine.sol";

contract ScalperAgent is ArbDecisionEngine {
    constructor(address _decisionRegistry, address _poolScanner) ArbDecisionEngine(_decisionRegistry, _poolScanner) {}

    function scalperDecision(address tokenA, address tokenB, address dexA, address dexB) external {
        // Logic for quick small trades, low risk, high frequency
        (DecisionType decision, uint256 confidence, uint256 riskScore, string memory reasoning) = makeDecision(tokenA, tokenB, dexA, dexB);
        // Adjust for scalper: prefer low spread, quick execution
    }
}