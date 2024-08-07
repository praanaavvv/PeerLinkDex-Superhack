// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./utils/EventEmitter.sol";

/**
 * @title Escrow Initiator
 * @notice This escrow contract is called by Orderbook Contract as well
 */

contract Escrow is EventEmitter {
    enum EscrowState {
        Initiated,
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

    // Functions

    /**
     * @dev This function create an escrow arrangement as the user requests
     * @param participant Address of the escrow participant whom the sender is expecting funds from in exchange of their funds
     * @param tokenInAddress Token address of the escrow initiator token
     * @param tokenOutAddress Token address of the escrow participant token
     * @param amountIn Amount the initiator is willing to give
     * @param amountOut Amount the initiator is expecting at current market rate with slippage included
     * @param duration Duration for which the escrow should be valid and cannot be accessed after it
     */
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
            EscrowState.Initiated
        );

        IERC20 tokenIn = IERC20(escrowDetails.tokenInAddress);

        // require(
        //     token.approve(address(this), escrowDetails.amountIn),
        //     "Allowance Failed"
        // );

        require(
            tokenIn.allowance(msg.sender, address(this)) >=
                escrowDetails.amountIn,
            "Insufficient Allowance"
        );

        require(
            tokenIn.transferFrom(
                msg.sender,
                address(this),
                escrowDetails.amountIn
            ),
            "Transfer failed"
        );

        escrowDetails.state = EscrowState.Active;

        escrowInfo[escrowId] = escrowDetails;

        emitEscrowEvent(escrowId, escrowDetails);

        escrowId += 1;
    }

    /**
     * @dev This cancels any escrow arrangement and returns the funds to the users
     * @param _escrowId Escrow ID is the unique id of an escrow arrangement from which we can fetch details about an escrow
     */

    function cancelEscrowArrangement(uint256 _escrowId) public payable {
        EscrowDetails storage escrowDetails = escrowInfo[_escrowId];

        require(
            msg.sender == escrowDetails.initiator ||
                msg.sender == escrowDetails.participant,
            "Not authorized"
        );

        require(
            escrowDetails.state == EscrowState.Active,
            "Escrow is not active"
        );

        IERC20 token = IERC20(escrowDetails.tokenInAddress);
        require(
            token.transfer(escrowDetails.initiator, escrowDetails.amountIn),
            "Refund failed"
        );

        escrowDetails.state = EscrowState.Cancelled;

        escrowInfo[_escrowId] = escrowDetails;

        emitEscrowEvent(_escrowId, escrowDetails);
    }

    /**
     * @dev Completes the escrow by exchanging the tokens between two parties
     * @param _escrowId Takes in escrow ID as an input
     */
    function completeEscrowArrangement(uint256 _escrowId) public payable {
        EscrowDetails memory escrowDetails = escrowInfo[_escrowId];

        require(
            msg.sender == escrowDetails.participant,
            "Only participant can complete the escrow"
        );

        require(
            block.timestamp <=
                escrowDetails.startingTimestamp + escrowDetails.duration,
            "Escrow is Expired"
        );

        IERC20 tokenOut = IERC20(escrowDetails.tokenOutAddress);

        // require(
        //     tokenOut.approve(address(this), escrowDetails.amountOut),
        //     "Allowance Failed"
        // );

        require(
            tokenOut.allowance(msg.sender, address(this)) >=
                escrowDetails.amountOut,
            "Insufficient Allowance"
        );

        require(
            tokenOut.transferFrom(
                msg.sender,
                address(this),
                escrowDetails.amountOut
            ),
            "Transfer failed"
        );

        // Instance of input token
        IERC20 tokenIn = IERC20(escrowDetails.tokenInAddress);

        require(
            tokenOut.transfer(escrowDetails.initiator, escrowDetails.amountOut),
            "Transfer Failed to Initiator"
        );

        require(
            tokenIn.transfer(escrowDetails.participant, escrowDetails.amountIn),
            "Transfer Failed to Participant"
        );

        escrowDetails.state = EscrowState.Completed;

        escrowInfo[_escrowId] = escrowDetails;

        emitEscrowEvent(_escrowId, escrowDetails);
    }

    // View functions
    function getEscrowId() public view returns (uint256) {
        return escrowId;
    }

    function getEscrowInfo(
        uint256 _escrowId
    ) public view returns (EscrowDetails memory) {
        return escrowInfo[_escrowId];
    }
}
