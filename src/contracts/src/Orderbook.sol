// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Escrow.sol";

contract Orderbook is AutomationCompatibleInterface {
    Escrow public escrow;
    uint256 public orderIdCounter;
    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public userOrders;

    event OrderCreated(
        uint256 orderId,
        address indexed user,
        uint256 amount,
        uint256 price,
        bool isBuyOrder
    );
    event OrderMatched(uint256 buyOrderId, uint256 sellOrderId);
    event OrderCancelled(uint256 orderId);

    struct Order {
        uint256 orderId;
        address user;
        address tokenAddress;
        uint256 amount;
        uint256 price;
        uint256 timestamp;
        bool isBuyOrder;
        bool isActive;
    }

    constructor(address escrowAddress) {
        escrow = Escrow(escrowAddress);
    }

    function createOrder(
        address tokenAddress,
        uint256 amount,
        uint256 price,
        bool isBuyOrder
    ) public {
        orderIdCounter += 1;
        Order memory newOrder = Order(
            orderIdCounter,
            msg.sender,
            tokenAddress,
            amount,
            price,
            block.timestamp,
            isBuyOrder,
            true
        );
        orders[orderIdCounter] = newOrder;
        userOrders[msg.sender].push(orderIdCounter);

        // Lock funds in escrow
        if (isBuyOrder) {
            // Buyer locks payment tokens
            require(
                IERC20(tokenAddress).transferFrom(
                    msg.sender,
                    address(escrow),
                    amount * price
                ),
                "Payment transfer failed"
            );
        } else {
            // Seller locks tokens to sell
            require(
                IERC20(tokenAddress).transferFrom(
                    msg.sender,
                    address(escrow),
                    amount
                ),
                "Token transfer failed"
            );
        }

        emit OrderCreated(
            orderIdCounter,
            msg.sender,
            amount,
            price,
            isBuyOrder
        );
    }

    function matchOrders() internal {
        for (uint256 i = 1; i <= orderIdCounter; i++) {
            for (uint256 j = i + 1; j <= orderIdCounter; j++) {
                Order storage buyOrder = orders[i];
                Order storage sellOrder = orders[j];
                if (
                    buyOrder.isActive &&
                    sellOrder.isActive &&
                    buyOrder.isBuyOrder &&
                    !sellOrder.isBuyOrder &&
                    buyOrder.price >= sellOrder.price &&
                    buyOrder.amount == sellOrder.amount &&
                    buyOrder.timestamp <= sellOrder.timestamp
                ) {
                    // Match found, execute trade
                    executeTrade(buyOrder, sellOrder);
                    break;
                }
            }
        }
    }

    function executeTrade(
        Order storage buyOrder,
        Order storage sellOrder
    ) internal {
        // Transfer tokens
        escrow.completeEscrowArrangement(buyOrder.orderId);
        escrow.completeEscrowArrangement(sellOrder.orderId);

        buyOrder.isActive = false;
        sellOrder.isActive = false;

        emit OrderMatched(buyOrder.orderId, sellOrder.orderId);
    }

    function cancelOrder(uint256 orderId) public {
        Order storage order = orders[orderId];
        require(order.user == msg.sender, "Not authorized");
        require(order.isActive, "Order is not active");

        order.isActive = false;

        // Refund locked funds
        if (order.isBuyOrder) {
            escrow.cancelEscrowArrangement(orderId);
        } else {
            escrow.cancelEscrowArrangement(orderId);
        }

        emit OrderCancelled(orderId);
    }

    function getUserOrders(
        address user
    ) public view returns (uint256[] memory) {
        return userOrders[user];
    }

    // Chainlink Keeper-compatible methods
    function checkUpkeep(
        bytes calldata
    ) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = false;
        for (uint256 i = 1; i <= orderIdCounter; i++) {
            for (uint256 j = i + 1; j <= orderIdCounter; j++) {
                Order storage buyOrder = orders[i];
                Order storage sellOrder = orders[j];
                if (
                    buyOrder.isActive &&
                    sellOrder.isActive &&
                    buyOrder.isBuyOrder &&
                    !sellOrder.isBuyOrder &&
                    buyOrder.price >= sellOrder.price &&
                    buyOrder.amount == sellOrder.amount &&
                    buyOrder.timestamp <= sellOrder.timestamp
                ) {
                    upkeepNeeded = true;
                    return (upkeepNeeded, "");
                }
            }
        }
    }

    function performUpkeep(bytes calldata) external override {
        matchOrders();
    }
}
