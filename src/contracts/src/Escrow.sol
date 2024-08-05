// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Escrow Initiator
 * @author Ankush Jha
 * @notice This escrow contract is called by Orderbook Contract as well
 */

abstract contract Escrow is AutomationCompatibleInterface {
    enum EscrowState {
        Active,
        Completed,
        Cancelled
    }

    struct EscrowDetails {
        uint256 escrowId;
        address initiator;
        address participant;
        address tokenInAddress;
        address tokenOutAddress;
        uint256 amountIn;
        uint256 amountOut;
        uint256 startingTimestamp;
        uint256 duration;
        EscrowState state;
    }

    // Public Variables
    uint256 public escrowId = 0;
    mapping(uint256 => EscrowDetails) public escrowInfo;

    // Events
    event EscrowCreated(uint256 indexed escrowId, EscrowDetails escrowDetails);

    // Functions
    function createEscrowArrangement(
        address participant,
        address tokenInAddress,
        address tokenOutAddress,
        uint256 amountIn,
        uint256 amountOut,
        uint256 duration
    ) public payable {
        EscrowDetails memory escrowDetails = EscrowDetails(
            escrowId,
            msg.sender,
            participant,
            tokenInAddress,
            tokenOutAddress,
            amountIn,
            amountOut,
            block.timestamp,
            duration,
            EscrowState.Active
        );
        IERC20 token = IERC20(tokenInAddress);
        require(
            token.transferFrom(msg.sender, address(this), amountIn),
            "Transfer failed"
        );
        escrowInfo[escrowId] = escrowDetails;
        escrowId += 1;
        emit EscrowCreated(escrowId, escrowDetails);
    }

    function cancelEscrowArrangement(uint256 escrowId) public {
        
    }
}
