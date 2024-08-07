// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";
import {TokenIn} from "../src/tokens/TokenIn.sol";
import {TokenOut} from "../src/tokens/TokenOut.sol";
import {DeployTokenUtils} from "../src/utils/DeployTokenUtils.sol";
import {DeployEscrow} from "../script/Escrow.s.sol";
import {DeployTokens} from "../script/tokens/DeployTokens.s.sol";

contract EscrowTest is Test {
    Escrow public escrow;
    TokenIn public tokenIn;
    TokenOut public tokenOut;

    DeployEscrow public deployer;
    DeployTokens public tokenDeployer;

    address bob = makeAddr("bob");
    address alice = makeAddr("alice");

    function setUp() public {
        deployer = new DeployEscrow();
        tokenDeployer = new DeployTokens();
        escrow = deployer.run();
        DeployTokenUtils.TokenUtils memory tokenUtils = tokenDeployer.run();
        tokenIn = tokenUtils.tokenIn;
        tokenOut = tokenUtils.tokenOut;

        vm.startPrank(address(msg.sender));
        tokenIn.transfer(bob, 1000 ether);
        tokenOut.transfer(alice, 1000 ether);
        vm.stopPrank();
    }

    // We have 3 functions in our `Escrow.sol` contract which are to create, cancel and complete an escrow arrangement

    function testEscrowCreation() public {
        console.log(
            "Balance of tokenIn for bob is: ",
            tokenIn.balanceOf(address(bob))
        );

        console.log(
            "Balance of tokenOut for alice is: ",
            tokenOut.balanceOf(address(alice))
        );

        console.log("Bob's Address: ", bob);
        console.log("Alice's Address: ", alice);

        vm.startPrank(bob); // msg.sender for the next call is bob
        tokenIn.approve(address(escrow), 10 ether);
        escrow.createEscrowArrangement(
            alice,
            address(tokenIn),
            address(tokenOut),
            10 ether,
            100 ether,
            30 minutes
        );
        vm.stopPrank();

        vm.startPrank(alice); // msg.sender for the next call is alice
        tokenOut.approve(address(escrow), 100 ether);
        escrow.completeEscrowArrangement(0);
        vm.stopPrank();

        // Checking the balances of bob and alice after escrow is completed
        assertEq(tokenIn.balanceOf(bob), 990 ether);
        assertEq(tokenIn.balanceOf(alice), 10 ether);

        assertEq(tokenOut.balanceOf(bob), 100 ether);
        assertEq(tokenOut.balanceOf(alice), 900 ether);
    }

    function testCancelEscrow() public {
        vm.skip(true);
    }

    function testCompleteEscrow() public {
        vm.skip(true);
    }
}
