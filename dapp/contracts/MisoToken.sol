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
    address owner;

    // How many MISO tokens are given daily
    uint256 public dailyTokens = 12;

    // How many MISO tokens are used per feed
    uint256 public tokensPerFeed = 3;

    // When did you last claim your tokens
    mapping (address => uint) lastClaimed;

    // Feeding history
    mapping (address => uint[]) feedingHistory;

    // How many blocks before you can claim tokens
    uint public blocksPerClaim = 100;

    // Callback function everytime someone feeds an address
    // https://solidity.readthedocs.io/en/v0.4.21/contracts.html#events
    event feedEvent(address addr);

    function UsableToken(
        uint256 _initialAmount,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol
        ) public {
        owner = msg.sender;
        balances[this] = _initialAmount;
        totalSupply = _initialAmount;
        name = _tokenName;
        decimals = _decimalUnits;
        symbol = _tokenSymbol;
    }

    function changeBlocksPerClaim(uint newB) public {
        require(msg.sender == owner);
        blocksPerClaim = newB;
    }

    function getBlocksTillClaimable(address addr) public view returns (uint blockNo) {
        if (lastClaimed[addr] == 0) {
            return 0;
        }

        uint blockDif = (block.number - lastClaimed[addr] - 1);
        
        if (blockDif < blocksPerClaim) {
            return blocksPerClaim.sub(blockDif);
        }

        return 0;
    }

    function getLastClaimBlock(address addr) public view returns (uint blockNo) {
        return lastClaimed[addr];
    }

    function getFeedingHistory (address addr) public view returns (uint[]) {
        return feedingHistory[addr];
    }

    function getBlocksPerClaim () public view returns (uint) {
        return blocksPerClaim;
    }

    function getTokensPerFeed () public view returns (uint) {
        return tokensPerFeed;
    }

    function getDailyTokensNo () public view returns (uint) {
        return dailyTokens;
    }

    function getClaimableTokens (address addr) public view returns (uint) {
        uint value;

        if (lastClaimed[addr] == 0) {
            // Initial claim = set to current block number            
            value = dailyTokens;
        } else {
            // How many mutiples of food
            uint multiples = (block.number - lastClaimed[addr] - 1).div(blocksPerClaim);
            value = multiples * dailyTokens;
        }

        return value;
    }
        
    function claim() public returns (bool success) {
        // Can only claim tokens every 5k blocks
        if (block.number - lastClaimed[msg.sender] - 1 < blocksPerClaim) {
            return false;
        }
        
        uint value;
        if (lastClaimed[msg.sender] == 0) {
            // Initial claim = set to current block number            
            value = dailyTokens;
        } else {
            // How many mutiples of food
            uint multiples = (block.number - lastClaimed[msg.sender] - 1).div(blocksPerClaim);
            value = multiples * dailyTokens;
        }

        lastClaimed[msg.sender] = block.number - 1;
        balances[msg.sender] += value;
        balances[this] -= value;
        Transfer(this, msg.sender, value);

        return true;
    }

    function feed() public {
        require(balances[msg.sender] >= tokensPerFeed);

        // Add to feeding history
        feedingHistory[msg.sender].push(block.number - 1);

        balances[msg.sender] -= tokensPerFeed;
        balances[this] += tokensPerFeed;

        emit feedEvent(msg.sender);
    }
}