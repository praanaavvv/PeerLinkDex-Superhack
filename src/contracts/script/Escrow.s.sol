// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {Escrow} from "../src/Escrow.sol";

contract DeployEscrow is Script {
    function run() external returns (Escrow) {
        vm.startBroadcast();
        Escrow escrow = new Escrow();
        console.log("Escrow contract is deployed at: ", address(escrow));
        vm.stopBroadcast();
        return escrow;
    }
}
