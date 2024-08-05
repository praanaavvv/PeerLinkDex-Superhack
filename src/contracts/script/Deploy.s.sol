// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Escrow} from "../src/Escrow.sol";
import {Orderbook} from "../src/Orderbook.sol";
import {DeployUtils} from "../src/utils/DeployUtils.sol";

contract Deploy is Script {

    function run() external returns (DeployUtils.DeployedInstances memory) {
        vm.startBroadcast();

        // Deploy Escrow
        Escrow escrow = new Escrow();
        console.log("Escrow contract is deployed at: ", address(escrow));

        // Deploy Orderbook
        Orderbook orderbook = new Orderbook(address(escrow));
        console.log("Orderbook contract is deployed at: ", address(orderbook));

        vm.stopBroadcast();
        return DeployUtils.DeployedInstances(escrow, orderbook);
    }
}
