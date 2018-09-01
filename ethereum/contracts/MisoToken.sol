// This Token Contract implements the standard token functionality (https://github.com/ethereum/EIPs/issues/20)
// You can find more complex example in https://github.com/ConsenSys/Tokens 
pragma solidity ^0.4.8;

import "./BaseToken.sol";
import "./SafeMath.sol";

contract MisoToken is BaseToken {
    using SafeMath for uint;
    using SafeMath for uint256;

    // Standard Solidity Interface
    string public name;
    uint8 public decimals;    
    string public symbol;
    string public version = "MISO";

    // MISO Token Specific

    // How many MISO tokens are given daily
    uint256 public dailyTokens = 100;

    // When did you last claim your tokens
    mapping (address => uint) lastClaimed;

    // How many blocks before you can claim tokens
    uint public blocksPerClaim = 5000;

    function UsableToken(
        uint256 _initialAmount,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol
        ) public {
        balances[this] = _initialAmount;
        totalSupply = _initialAmount;
        name = _tokenName;
        decimals = _decimalUnits;
        symbol = _tokenSymbol;
    }
        
    function claim() public returns (bool success) {
        // Can only claim tokens every 5k blocks
        if (block.number - lastClaimed[msg.sender] - 1 < blocksPerClaim) {
            revert();
        }
        
        uint value;
        if (lastClaimed[msg.sender] == 0) {
            // Initial claim = set to current block number            
            value = dailyTokens;
        } else {
            // How many mutiples of food
            uint multiples = (block.number - lastClaimed[msg.sender] - 1) / blocksPerClaim;
            value = multiples * dailyTokens;
        }

        lastClaimed[msg.sender] = block.number - 1;
        balances[msg.sender] += value;
        balances[this] -= value;
        Transfer(this, msg.sender, value);

        return true;
    }
}