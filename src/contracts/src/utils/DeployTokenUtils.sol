// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import {TokenIn} from "../tokens/TokenIn.sol";
import {TokenOut} from "../tokens/TokenOut.sol";

contract DeployTokenUtils {
    struct TokenUtils {
        TokenIn tokenIn;
        TokenOut tokenOut;
    }
}
