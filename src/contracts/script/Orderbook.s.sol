// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Orderbook} from "../src/Orderbook.sol";

contract DeployOrderbook is Script {
    function run() external returns (Orderbook) {
        vm.startBroadcast();
        Orderbook orderbook = new Orderbook(address(0));
        console.log("Orderbook Contract is deployed at: ", address(orderbook));
        vm.stopBroadcast();
        return orderbook;
    }
}
