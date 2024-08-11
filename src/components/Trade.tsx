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
  const escrowContractAddress: Address = addresses.escrow as Address;
  const TOKEN_DECIMALS = 18;
  const [escrowId, setEscrowId] = useState<number | undefined>(undefined);
  const [participantAddress, setParticipantAddress] = useState<string>("");
  const [tokenInAddress, setTokenInAddress] = useState<string>("");
  const [tokenOutAddress, setTokenOutAddress] = useState<string>("");
  const [amountIn, setAmountIn] = useState<number | undefined>(undefined);
  const [amountOut, setAmountOut] = useState<number | undefined>(undefined);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [approvalComplete, setApprovalComplete] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showAlert = (message: string, duration: number = 5000) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(null), duration);
  };

  const showSuccessMessage = (message: string, duration: number = 5000) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), duration);
  };

  const convertToUnits = (amount: number): bigint => {
    return BigInt(amount * Math.pow(10, TOKEN_DECIMALS));
  };

  const handleTokenApproval = async () => {
    if (!isConnected || !walletClient || !address) {
      showAlert("Please connect your wallet to proceed.");
      return;
    }

    try {
      const wallet = createWalletClient({
        chain: baseSepolia,
        transport: custom(walletClient),
      });

      const amountInUnits = convertToUnits(amountIn as number);

      const allowanceResponse = await baseSepoliaClient.readContract({
        address: tokenInAddress as Address,
        abi: TokenInABI,
        functionName: "allowance",
        args: [address, escrowContractAddress],
      });

      const allowance = BigInt(allowanceResponse.toString());

      if (amountInUnits > allowance) {
        const approvalResponse = await wallet.writeContract({
          address: tokenInAddress as Address,
          account: address,
          abi: TokenInABI,
          functionName: "approve",
          args: [escrowContractAddress, amountInUnits],
        });

        const receipt = await baseSepoliaClient.waitForTransactionReceipt({
          hash: approvalResponse,
        });

        if (receipt.status === "success") {
          showSuccessMessage("Tokens approved successfully!");
          setApprovalComplete(true);
        } else {
          showAlert("Token approval failed.");
        }
      } else {
        setApprovalComplete(true);
        showSuccessMessage("Tokens already approved.");
      }
    } catch (error) {
      console.error("Token approval failed:", error);
      showAlert("Token approval failed due to an error.");
    }
  };

  // const handleTokenApprovalForCompleteEscrow = async () => {
  //   if (!isConnected || !walletClient || !address) {
  //     showAlert("Please connect your wallet to proceed.");
  //     return;
  //   }

  //   try {
  //     const wallet = createWalletClient({
  //       chain: baseSepolia,
  //       transport: custom(walletClient),
  //     });

  //     const amountInUnits = convertToUnits(amountIn as number);
  //     const escrowDetails = await baseSepoliaClient.readContract({
  //       address: escrowContractAddress,
  //       abi: EscrowABI,
  //       functionName: "getEscrowInfo",
  //       args: [BigInt(escrowId as number)],
  //     });

  //     const amountOutUnits = BigInt(escrowDetails.amountOut.toString());

  //     const allowanceResponse = await baseSepoliaClient.readContract({
  //       address: tokenInAddress as Address,
  //       abi: TokenOutABI,
  //       functionName: "allowance",
  //       args: [address, escrowContractAddress],
  //     });

  //     const allowance = BigInt(allowanceResponse.toString());

  //     if (amountOutUnits > allowance) {
  //       const approvalResponse = await wallet.writeContract({
  //         address: tokenInAddress as Address,
  //         account: address,
  //         abi: TokenOutABI,
  //         functionName: "approve",
  //         args: [escrowContractAddress, amountOutUnits],
  //       });

  //       const receipt = await baseSepoliaClient.waitForTransactionReceipt({
  //         hash: approvalResponse,
  //       });

  //       if (receipt.status === "success") {
  //         showSuccessMessage("Tokens approved successfully!");
  //         setApprovalComplete(true);
  //       } else {
  //         showAlert("Token approval failed.");
  //       }
  //     } else {
  //       setApprovalComplete(true);
  //       showSuccessMessage("Tokens already approved.");
  //     }
  //   } catch (error) {
  //     console.error("Token approval failed:", error);
  //     showAlert("Token approval failed due to an error.");
  //   }
  // };

  const handleTokenApprovalForCompleteEscrow = async () => {
    if (!isConnected || !walletClient || !address) {
      showAlert("Please connect your wallet to proceed.");
      return;
    }

    try {
      const wallet = createWalletClient({
        chain: baseSepolia,
        transport: custom(walletClient),
      });

      // const amountInUnits = convertToUnits(amountIn as number);

      // Read escrow details
      const escrowDetailsResponse = await baseSepoliaClient.readContract({
        address: escrowContractAddress,
        abi: EscrowABI,
        functionName: "getEscrowInfo",
        args: [BigInt(escrowId as number)],
      });

      if (!escrowDetailsResponse) {
        throw new Error("Failed to fetch escrow details");
      }

      const escrowDetails = escrowDetailsResponse as {
        escrowId: bigint;
        initiator: string;
        participant: string;
        tokenInAddress: string;
        tokenOutAddress: string;
        amountIn: bigint;
        amountOut: bigint;
        startingTimestamp: bigint;
        duration: bigint;
        state: number;
      };

      const amountOutUnits = escrowDetails.amountOut;

      // Read allowance
      const allowanceResponse = await baseSepoliaClient.readContract({
        address: escrowDetails.tokenInAddress as Address,
        abi: TokenOutABI,
        functionName: "allowance",
        args: [address, escrowContractAddress],
      });

      const allowance = BigInt(allowanceResponse.toString());

      if (amountOutUnits > allowance) {
        const approvalResponse = await wallet.writeContract({
          address: escrowDetails.tokenInAddress as Address,
          account: address,
          abi: TokenOutABI,
          functionName: "approve",
          args: [escrowContractAddress, amountOutUnits],
        });

        const receipt = await baseSepoliaClient.waitForTransactionReceipt({
          hash: approvalResponse,
        });

        if (receipt.status === "success") {
          showSuccessMessage("Tokens approved successfully!");
          setApprovalComplete(true);
        } else {
          showAlert("Token approval failed.");
        }
      } else {
        setApprovalComplete(true);
        showSuccessMessage("Tokens already approved.");
      }
    } catch (error) {
      console.error("Error in handleTokenApprovalForCompleteEscrow:", error);
      showAlert("Token approval failed due to an error.");
    }
  };

  const createEscrow = async () => {
    if (!isConnected || !walletClient || !address) return;

    try {
      const wallet = createWalletClient({
        chain: baseSepolia,
        transport: custom(walletClient),
      });

      const amountInUnits = convertToUnits(amountIn as number);
      const amountOutUnits = convertToUnits(amountOut as number);

      const transaction = await wallet.writeContract({
        address: escrowContractAddress,
        account: address,
        abi: EscrowABI,
        functionName: "createEscrowArrangement",
        args: [
          participantAddress as Address,
          tokenInAddress as Address,
          tokenOutAddress as Address,
          amountInUnits,
          amountOutUnits,
          BigInt(duration as number),
        ],
      });

      console.log("Transaction submitted:", transaction);
      showSuccessMessage("Escrow created successfully!");
    } catch (error) {
      console.error("Failed to create escrow:", error);
      showAlert("Failed to create escrow due to an error.");
    }
  };

  const cancelEscrow = async () => {
    if (!isConnected || !walletClient || !address) {
      showAlert("Please connect your wallet to proceed.");
      return;
    }

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
      showSuccessMessage("Escrow cancelled successfully!");
    } catch (error) {
      console.error("Failed to cancel escrow:", error);
      showAlert("Failed to cancel escrow due to an error.");
    }
  };

  const completeEscrow = async () => {
    if (!isConnected || !walletClient || !address) {
      showAlert("Please connect your wallet to proceed.");
      return;
    }

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
      showSuccessMessage("Escrow completed successfully!");
    } catch (error) {
      console.error("Failed to complete escrow:", error);
      showAlert("Failed to complete escrow due to an error.");
    }
  };

  return (
    <>
      {alertMessage && (
        <div className="alert">
          <i className="fas fa-info-circle"></i> {alertMessage}
        </div>
      )}
      {successMessage && (
        <div className="success">
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}
      <div className="trade-container">
        {isConnected ? (
          <>
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
                {!approvalComplete ? (
                  <button className="btn" onClick={handleTokenApproval}>
                    Allow Tokens
                  </button>
                ) : (
                  <button className="btn" onClick={createEscrow}>
                    Create Escrow Arrangement
                  </button>
                )}
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
                {!approvalComplete ? (
                  <button
                    className="btn"
                    onClick={handleTokenApprovalForCompleteEscrow}
                  >
                    Allow Tokens
                  </button>
                ) : (
                  <button className="btn" onClick={completeEscrow}>
                    Complete Escrow
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>Please connect your wallet to view this page</p>
        )}
      </div>
    </>
  );
};

export default Trade;
