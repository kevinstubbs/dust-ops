// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Script, console2} from 'forge-std/Script.sol';
import {BatchCallDelegation} from '../src/BatchCallDelegation.sol';

contract BatchCallDelegationScript is Script {
  function setUp() public {}

  function run() public {
    uint256 deployerPrivateKey = vm.envUint('PRIVATE_KEY');
    vm.startBroadcast(deployerPrivateKey);

    BatchCallDelegation batchCallDelegation = new BatchCallDelegation();
    console2.log('BatchCallDelegation deployed to:', address(batchCallDelegation));

    vm.stopBroadcast();
  }
}
