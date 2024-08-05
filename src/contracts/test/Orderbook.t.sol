// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Orderbook} from "../src/Orderbook.sol";
import {Escrow} from "../src/Escrow.sol";
import {DeployUtils} from "../src/utils/DeployUtils.sol";
import {DeployOrderbook} from "../script/Orderbook.s.sol";
import {Deploy} from "../script/Deploy.s.sol";

contract OrderbookTest is Test {
    Orderbook public orderbook;
    Escrow public escrow;
    Deploy public deployer;

    address bob = makeAddr("bob");
    address alice = makeAddr("alice");
    address tokenAddress = makeAddr("token");

    function setUp() public {
        deployer = new Deploy();
        DeployUtils.DeployedInstances memory deployedInstances = deployer.run();
        orderbook = deployedInstances.orderbook;
        escrow = deployedInstances.escrow;
    }
}
