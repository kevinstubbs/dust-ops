pragma solidity 0.8.20;

/* @dev For MVP deployment:
    - Main contract is on Ethereum, where users will first interact with the system
    - User sends information about all tokens to be sold, this info is bridged to selling contracts on other chains
    - ETH is received back from other chains, and is shielded with Railgun if privacy is enabled
*/

contract MainContract {

    // Counter that tracks the amount of chains that we expect to receive ETH from
    uint totalChainsSelling;

    // Counter that tracks the amount of chains that have sent ETH to this contract
    uint totalChainsSentETH;


    function executeTokenSwaps(array[] chainIds, array[] swapInfo, bool privacy) external {

        totalChainsSelling = chainIds.length;

        // 1. Send bridging messages to other chains to sell tokens on that chain

        // 2. Sell tokens on this chain

    }


    /// @notice Receives ETH from a selling contract on a different chain
    function receiveETH() external {

        totalChainsSentETH++;

        if (totalChainsSentETH == totalChainsSelling) {
            // 3. If all chains have sent ETH, shield the ETH
            shieldETH();
        }
    }


    /// @notice Swaps a specified amount of a token for the other token in the pair at a specified dex contract
    function swapToken(address dexContract, address token, uint256 amount) external {
    }

    /// @notice Shield received ETH with Railgun
    function shieldETH() external {
    }

    /// @notice Send message to other chains to sell tokens
    function sendSwapMessage() {

    }

}

contract SellingContract {

    address public mainContract;

    function receiveMessage() external {

        // 1. Decode message

        uint totalTokenSwaps;

        // 2. Sell tokens
        for (uint i = 0; i < totalTokenSwaps; i++) {
            swapToken(dexContract, token, amount);
        }

        // 3. Bridge ETH to the main contract
        bridgeETH();
    }

    /// @notice Swaps a specified amount of a token for the other token in the pair at a specified dex contract
    function swapToken(address dexContract, address token, uint256 amount) external {
    }

    /// @notice Bridge ETH received from selling tokens to the shield contract
    function bridgeETH() external {
    }

}