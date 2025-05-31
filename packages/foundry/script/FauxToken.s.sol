// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console2} from 'forge-std/Script.sol';
import {FauxToken} from '../src/FauxToken.sol';

contract FauxTokenScript is Script {
  /**
   * @dev Relevant source part starts here and spans across multiple lines
   */
  function setUp() public {}

  /**
   * @dev Main deployment script
   */
  function run() public {
    // Setup
    // uint256 deployerPrivateKey = vm.envUint('WALLET_PRIVATE_KEY');
    // vm.startBroadcast(deployerPrivateKey);
    address TARGET = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    // Deploy
    uint256 baseTransferAmount = 2600;

    for (uint8 i = 0; i < 26; i++) {
      string memory name = string(abi.encodePacked('Token', bytes1(i + 65))); // 'A' = 65
      string memory symbol = string(abi.encodePacked(bytes1(i + 65), bytes1(i + 65), bytes1(i + 65))); // 'AAA' to 'ZZZ'

      FauxToken ft = new FauxToken(name, symbol, 1_000 * 10 ** 18);
      //   deployedTokens.push(ft);

      // Each token should transfer fewer than the one before.
      uint256 transferAmount = baseTransferAmount - (i * 100);
      console2.log(ft.totalSupply(), 'sending', transferAmount);
      ft.transfer(TARGET, transferAmount * 10 ** 18);
    }

    // End
    vm.stopBroadcast();
  }
}
