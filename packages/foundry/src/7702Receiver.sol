pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MainContract is OApp, OAppOptionsType3 {
    constructor(address _endpoint, address _delegate) OApp(_endpoint, _delegate) Ownable(_delegate) {}

    string public data = "Nothing received yet.";

    /* @dev For MVP deployment:
        - Main contract is on Arbitrum, where users will first interact with the system
        - User sends information about all tokens to be sold, this info is bridged to selling contracts on other chains
        - ETH is received back from other chains, and is shielded with Railgun if privacy is enabled
    */

    // Counter that tracks the amount of chains that we expect to receive ETH from
    uint public totalChainsSelling;

    // Counter that tracks the amount of chains that have sent ETH to this contract
    uint public totalChainsSentETH;

    // Struct to define swap information for a token
    struct SwapInfo {
        address dexContract;       // The DEX contract to interact with
        address token;             // The token to be swapped
        uint256 amount;            // The amount of tokens to swap
        bytes dexCalldata;         // Encoded calldata for the DEX interaction
    }

    // Message types for cross-chain communication
    enum MessageType { SWAP_REQUEST, ETH_BRIDGED }

    /**
     * @notice Execute token swaps across multiple chains
     * @param chainIds Array of chain IDs where tokens will be sold
     * @param swapInfoArrays Array of arrays containing swap information for each chain
     * @param privacy Flag indicating whether to shield ETH after all swaps are complete
     */
    function executeTokenSwaps(
        uint32[] calldata chainIds,
        SwapInfo[][] calldata swapInfoArrays,
        bool privacy
    ) external payable {
        require(chainIds.length == swapInfoArrays.length, "Chain IDs and swap info arrays length mismatch");
        
        totalChainsSelling = chainIds.length;
        totalChainsSentETH = 0;

        // 1. Send bridging messages to other chains to sell tokens on that chain
        for (uint i = 0; i < chainIds.length; i++) {
            // Skip the current chain (Arbitrum)
            if (chainIds[i] != block.chainid) {
                // Properly encode the SwapInfo array directly without nesting
                bytes memory payload = abi.encode(MessageType.SWAP_REQUEST, abi.encode(swapInfoArrays[i]));
                bytes memory options = buildOptions(defaultOptions());
                _lzSend(chainIds[i], payload, options, MessagingFee(msg.value / chainIds.length, 0), payable(msg.sender));
            }
        }

        // 2. Sell tokens on this chain (Arbitrum)
        SwapInfo[] memory localSwaps;
        for (uint i = 0; i < chainIds.length; i++) {
            if (chainIds[i] == block.chainid) {
                localSwaps = swapInfoArrays[i];
                break;
            }
        }

        if (localSwaps.length > 0) {
            for (uint i = 0; i < localSwaps.length; i++) {
                swapToken(
                    localSwaps[i].dexContract, 
                    localSwaps[i].token, 
                    localSwaps[i].amount,
                    localSwaps[i].dexCalldata
                );
            }
            
            // Count local chain as completed
            totalChainsSentETH++;
            
            // Check if all chains have completed (rare case where only local chain had tokens)
            if (totalChainsSentETH == totalChainsSelling && privacy) {
                shieldETH();
            }
        }
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
    /// @dev Uses a generalized approach to interact with any DEX contract using custom calldata
    /// @param dexContract The address of the DEX contract
    /// @param token The address of the token to swap
    /// @param amount The amount of tokens to swap
    /// @param dexCalldata The encoded calldata for the DEX interaction
    /// @return amountReceived The amount of ETH received from the swap
    function swapToken(
        address dexContract,
        address token,
        uint256 amount,
        bytes memory dexCalldata
    ) internal returns (uint256 amountReceived) {
        // 1. Record ETH balance before swap to calculate received amount
        uint256 ethBalanceBefore = address(this).balance;
        
        // 2. Approve the DEX contract to spend tokens
        IERC20(token).approve(dexContract, amount);
        
        // 3. Call the DEX contract with the provided calldata
        (bool success, ) = dexContract.call(dexCalldata);
        require(success, "DEX swap failed");
        
        // 4. Calculate the amount of ETH received
        amountReceived = address(this).balance - ethBalanceBefore;
        
        return amountReceived;
    }

    /// @notice Shield received ETH with Railgun
    function shieldETH() internal {
        // Implementation will be added later
    }

    /**
     * @dev Internal function override to handle incoming messages from another chain.
     * @param _origin A struct containing information about the message sender.
     * @param payload The encoded message payload being received.
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 /*_guid*/,
        bytes calldata payload,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        // Decode the message type and payload
        (MessageType messageType, bytes memory messageData) = abi.decode(payload, (MessageType, bytes));
        
        if (messageType == MessageType.ETH_BRIDGED) {
            // Handle ETH bridged notification from another chain
            receiveETH();
        } else {
            // For other message types (like string messages from the original example)
            data = abi.decode(messageData, (string));
        }
    }
}

// Selling contract to be deployed on Optimism
contract SellingContract is OApp, OAppOptionsType3 {
    address public mainContract;
    uint32 public mainChainId;

    constructor(
        address _endpoint,
        address _delegate,
        address _mainContract,
        uint32 _mainChainId
    ) OApp(_endpoint, _delegate) Ownable(_delegate) {
        mainContract = _mainContract;
        mainChainId = _mainChainId;
    }

    // Define the swap info struct matching MainContract
    struct SwapInfo {
        address dexContract;       // The DEX contract to interact with
        address token;             // The token to be swapped
        uint256 amount;            // The amount of tokens to swap
        bytes dexCalldata;         // Encoded calldata for the DEX interaction
    }

    // Message types for cross-chain communication
    enum MessageType { SWAP_REQUEST, ETH_BRIDGED }

    /**
     * @dev Internal function override to handle incoming messages from another chain.
     * @param _origin A struct containing information about the message sender.
     * @param payload The encoded message payload being received.
     */
    function _lzReceive(
        Origin calldata _origin,
        bytes32 /*_guid*/,
        bytes calldata payload,
        address /*_executor*/,
        bytes calldata /*_extraData*/
    ) internal override {
        // Decode the message type and payload
        (MessageType messageType, bytes memory messageData) = abi.decode(payload, (MessageType, bytes));
        
        if (messageType == MessageType.SWAP_REQUEST) {
            // Properly decode the SwapInfo array
            SwapInfo[] memory swapInfos = abi.decode(abi.decode(messageData, (bytes)), (SwapInfo[]));
            
            // Perform token swaps
            for (uint i = 0; i < swapInfos.length; i++) {
                SwapInfo memory info = swapInfos[i];
                swapToken(
                    info.dexContract,
                    info.token,
                    info.amount,
                    info.dexCalldata
                );
            }
            
            // Bridge ETH back to the main contract
            bridgeETH();
            
            // Send message back to main contract that ETH is on the way
            sendETHBridgedMessage();
        }
    }

    /// @notice Swaps a specified amount of a token for the other token in the pair at a specified dex contract
    /// @dev Uses a generalized approach to interact with any DEX contract using custom calldata
    /// @param dexContract The address of the DEX contract
    /// @param token The address of the token to swap
    /// @param amount The amount of tokens to swap
    /// @param dexCalldata The encoded calldata for the DEX interaction
    /// @return amountReceived The amount of ETH received from the swap
    function swapToken(
        address dexContract,
        address token,
        uint256 amount,
        bytes memory dexCalldata
    ) internal returns (uint256 amountReceived) {
        // 1. Record ETH balance before swap to calculate received amount
        uint256 ethBalanceBefore = address(this).balance;
        
        // 2. Approve the DEX contract to spend tokens
        IERC20(token).approve(dexContract, amount);
        
        // 3. Call the DEX contract with the provided calldata
        (bool success, ) = dexContract.call(dexCalldata);
        require(success, "DEX swap failed");
        
        // 4. Calculate the amount of ETH received
        amountReceived = address(this).balance - ethBalanceBefore;
        
        return amountReceived;
    }

    /// @notice Bridge ETH received from selling tokens to the main contract
    function bridgeETH() internal {
        // Implementation will be added later
        // This would call a bridging protocol to send ETH back to Arbitrum
    }

    /// @notice Send a message back to main contract indicating ETH has been bridged
    function sendETHBridgedMessage() internal {
        bytes memory payload = abi.encode(MessageType.ETH_BRIDGED, "");
        bytes memory options = buildOptions(defaultOptions());
        
        // Send message back to main contract on Arbitrum
        _lzSend(
            mainChainId,
            payload,
            options,
            MessagingFee(address(this).balance / 10, 0), // Use some ETH for gas
            payable(address(this))
        );
    }
}
