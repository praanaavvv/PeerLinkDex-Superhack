// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {TokenIn} from "../../src/tokens/TokenIn.sol";
import {TokenOut} from "../../src/tokens/TokenOut.sol";
import {DeployTokenUtils} from "../../src/utils/DeployTokenUtils.sol";

contract DeployTokens is Script {
    function run() external returns (DeployTokenUtils.TokenUtils memory) {
        vm.startBroadcast();

        TokenIn tokenIn = new TokenIn();
        console.log("TokenIn is deployed at: ", address(tokenIn));
        
        TokenOut tokenOut = new TokenOut();
        console.log("TokenOut is deployed at: ", address(tokenOut));

        vm.stopBroadcast();

        return DeployTokenUtils.TokenUtils(tokenIn, tokenOut);
    }
}
