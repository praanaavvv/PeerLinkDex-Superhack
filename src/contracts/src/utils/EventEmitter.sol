// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../Escrow.sol";

contract EventEmitter {
    event EscrowEvent(
        uint256 indexed escrowId,
        Escrow.EscrowDetails escrowDetails
    );

    function emitEscrowEvent(
        uint256 escrowId,
        Escrow.EscrowDetails memory escrowDetails
    ) internal {
        emit EscrowEvent(escrowId, escrowDetails);
    }
}
