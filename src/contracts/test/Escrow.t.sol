// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";
import {Deploy} from "../script/Deploy.s.sol";
import {DeployUtils} from "../src/utils/DeployUtils.sol";

contract EscrowTest is Test {
    Escrow public escrow;
    Deploy public deployer;

    address bob = makeAddr("bob");
    address alice = makeAddr("alice");
    address tokenAddress = makeAddr("token");

    function setUp() public {
        deployer = new Deploy();
        DeployUtils.DeployedInstances memory deployedInstances = deployer.run();
        escrow = deployedInstances.escrow;
    }
}
