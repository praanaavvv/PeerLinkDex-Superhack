// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Escrow.sol";  // Import your Escrow contract

/**
 * @title P2P Orderbook
 * @author Ankush Jha
 * @notice This contract manages the P2P orderbook and matches orders based on time and size.
 */

contract Orderbook {
    struct Order {
        uint256 orderId;
        address user;
        address tokenAddress;
        uint256 amount;
        uint256 timestamp;
        bool isBuyOrder;
        bool isMatched;
    }

    uint256 public orderCounter;
    mapping(uint256 => Order) public orders;
    Escrow public escrow;

    event OrderPlaced(uint256 orderId, address indexed user, address tokenAddress, uint256 amount, bool isBuyOrder);
    event OrderWithdrawn(uint256 orderId, address indexed user);
    event OrderMatched(uint256 buyOrderId, uint256 sellOrderId);

    constructor(address _escrowAddress) {
        escrow = Escrow(_escrowAddress);
    }

    function placeOrder(address tokenAddress, uint256 amount, bool isBuyOrder) public {
        orderCounter++;
        orders[orderCounter] = Order(orderCounter, msg.sender, tokenAddress, amount, block.timestamp, isBuyOrder, false);
        emit OrderPlaced(orderCounter, msg.sender, tokenAddress, amount, isBuyOrder);
    }

    function withdrawOrder(uint256 orderId) public {
        require(orders[orderId].user == msg.sender, "Only the order creator can withdraw the order");
        require(!orders[orderId].isMatched, "Cannot withdraw a matched order");

        delete orders[orderId];
        emit OrderWithdrawn(orderId, msg.sender);
    }

    function matchOrders(uint256 buyOrderId, uint256 sellOrderId) public {
        require(orders[buyOrderId].isBuyOrder, "First order must be a buy order");
        require(!orders[sellOrderId].isBuyOrder, "Second order must be a sell order");
        require(!orders[buyOrderId].isMatched && !orders[sellOrderId].isMatched, "Orders must not be matched already");
        require(orders[buyOrderId].amount == orders[sellOrderId].amount, "Order sizes must match");

        // Move orders to escrow contract
        escrow.createEscrowArrangement(
            orders[buyOrderId].user,
            orders[sellOrderId].user,
            orders[buyOrderId].tokenAddress,
            orders[buyOrderId].amount,
            block.timestamp + 30 minutes
        );

        orders[buyOrderId].isMatched = true;
        orders[sellOrderId].isMatched = true;

        emit OrderMatched(buyOrderId, sellOrderId);
    }
}
