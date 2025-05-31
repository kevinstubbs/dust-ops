pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OApp, MessagingFee, Origin } from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";
import { MessagingReceipt } from "@layerzerolabs/oapp-evm/contracts/oapp/OAppSender.sol";
import { OAppOptionsType3 } from "@layerzerolabs/oapp-evm/contracts/oapp/libs/OAppOptionsType3.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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
