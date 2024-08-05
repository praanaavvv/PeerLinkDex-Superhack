// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "../Escrow.sol";
import "../Orderbook.sol";

contract DeployUtils {
    struct DeployedInstances {
        Escrow escrow;
        Orderbook orderbook;
    }
}
