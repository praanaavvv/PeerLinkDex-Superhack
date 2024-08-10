import React, { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { createWalletClient, custom, Address } from "viem";
import { baseSepolia } from "viem/chains";
import addresses from "../utils/addresses";
import "../styles/Trade.css"; // Import CSS file
import baseSepoliaClient from "../utils/client";
import { EscrowABI, TokenInABI, TokenOutABI } from "../abi/abi";

const Trade: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const escrowContractAddress: Address = addresses["escrow"] as Address;

  const [escrowId, setEscrowId] = useState<number | undefined>(undefined);
  const [participantAddress, setParticipantAddress] = useState<string>("");
  const [tokenInAddress, setTokenInAddress] = useState<string>("");
  const [tokenOutAddress, setTokenOutAddress] = useState<string>("");
  const [amountIn, setAmountIn] = useState<number | undefined>(undefined);
  const [amountOut, setAmountOut] = useState<number | undefined>(undefined);
  const [duration, setDuration] = useState<number | undefined>(undefined);

  // const createEscrow = async () => {
  //   if (!isConnected || !walletClient || !address) return;

  //   try {
  //     const wallet = createWalletClient({
  //       chain: baseSepolia,
  //       transport: custom(walletClient),
  //     });

  //     const transaction = await wallet.writeContract({
  //       address: escrowContractAddress,
  //       account: address,
  //       abi: EscrowABI,
  //       functionName: "createEscrowArrangement",
  //       args: [
  //         participantAddress as Address,
  //         tokenInAddress as Address,
  //         tokenOutAddress as Address,
  //         BigInt(amountIn as number),
  //         BigInt(amountOut as number),
  //         BigInt(duration as number),
  //       ],
  //     });

  //     console.log("Transaction submitted:", transaction);
  //   } catch (error) {
  //     console.error("Failed to create escrow:", error);
  //   }
  // };
  const createEscrow = async () => {
    if (!isConnected || !walletClient || !address) return;

    try {
      const wallet = createWalletClient({
        chain: baseSepolia,
        transport: custom(walletClient),
      });

      // Check allowance for tokenIn
      const allowanceResponse = await baseSepoliaClient.readContract({
        address: tokenInAddress as Address,
        abi: TokenInABI,
        functionName: "allowance",
        args: [address, escrowContractAddress],
      });
      const allowance = BigInt(allowanceResponse.toString());
      const amountInBigNumber = BigInt(amountIn as number);

      if (amountInBigNumber > allowance) {
        // Request approval for the required amount
        const approvalResponse = await wallet.writeContract({
          address: tokenInAddress as Address,
          account: address,
          abi: TokenInABI,
          functionName: "approve",
          args: [escrowContractAddress, amountInBigNumber],
        });

        console.log("Token approved:", approvalResponse);
        alert(
          "Token approval is required. Please wait for the approval transaction to complete."
        );
        return; // Exit function until approval is complete
      }

      // Proceed with creating escrow arrangement
      const transaction = await wallet.writeContract({
        address: escrowContractAddress,
        account: address,
        abi: EscrowABI,
        functionName: "createEscrowArrangement",
        args: [
          participantAddress as Address,
          tokenInAddress as Address,
          tokenOutAddress as Address,
          amountInBigNumber,
          BigInt(amountOut as number),
          BigInt(duration as number),
        ],
      });

      console.log("Transaction submitted:", transaction);
    } catch (error) {
      console.error("Failed to create escrow:", error);
    }
  };

  const cancelEscrow = async () => {
    if (!isConnected || !walletClient || !address) return;

    try {
      const wallet = createWalletClient({
        chain: baseSepolia,
        transport: custom(walletClient),
      });

      const transaction = await wallet.writeContract({
        address: escrowContractAddress,
        account: address,
        abi: EscrowABI,
        functionName: "cancelEscrowArrangement",
        args: [BigInt(escrowId as number)],
      });

      console.log("Escrow cancelled:", transaction);
    } catch (error) {
      console.error("Failed to cancel escrow:", error);
    }
  };

  const completeEscrow = async () => {
    if (!isConnected || !walletClient || !address) return;

    try {
      const wallet = createWalletClient({
        chain: baseSepolia,
        transport: custom(walletClient),
      });

      const transaction = await wallet.writeContract({
        address: escrowContractAddress,
        account: address,
        abi: EscrowABI,
        functionName: "completeEscrowArrangement",
        args: [BigInt(escrowId as number)],
      });

      console.log("Escrow completed:", transaction);
    } catch (error) {
      console.error("Failed to complete escrow:", error);
    }
  };

  return (
    <div className="trade-container">
      <h2>Trade Here</h2>
      {isConnected ? (
        <>
          <p>Connected as: {address}</p>
          <div className="form-container">
            <div className="form-group">
              <h3>Create Escrow</h3>
              <input
                type="text"
                placeholder="Participant Address (e.g., 0x123...)"
                value={participantAddress}
                onChange={(e) => setParticipantAddress(e.target.value)}
              />
              <input
                type="text"
                placeholder="Token In Address (e.g., 0xabc...)"
                value={tokenInAddress}
                onChange={(e) => setTokenInAddress(e.target.value)}
              />
              <input
                type="text"
                placeholder="Token Out Address (e.g., 0xdef...)"
                value={tokenOutAddress}
                onChange={(e) => setTokenOutAddress(e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount In (e.g., 1000)"
                value={amountIn}
                onChange={(e) => setAmountIn(Number(e.target.value))}
              />
              <input
                type="number"
                placeholder="Amount Out (e.g., 2000)"
                value={amountOut}
                onChange={(e) => setAmountOut(Number(e.target.value))}
              />
              <input
                type="number"
                placeholder="Duration in Seconds (e.g., 86400)"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
              <button className="btn" onClick={createEscrow}>
                Create Escrow
              </button>
            </div>

            <div className="form-group">
              <h3>Cancel Escrow</h3>
              <input
                type="number"
                placeholder="Escrow ID"
                value={escrowId}
                onChange={(e) => setEscrowId(Number(e.target.value))}
              />
              <button className="btn" onClick={cancelEscrow}>
                Cancel Escrow
              </button>
            </div>

            <div className="form-group">
              <h3>Complete Escrow</h3>
              <input
                type="number"
                placeholder="Escrow ID"
                value={escrowId}
                onChange={(e) => setEscrowId(Number(e.target.value))}
              />
              <button className="btn" onClick={completeEscrow}>
                Complete Escrow
              </button>
            </div>
          </div>
        </>
      ) : (
        <p>Please connect your wallet to start trading.</p>
      )}
    </div>
  );
};

export default Trade;
