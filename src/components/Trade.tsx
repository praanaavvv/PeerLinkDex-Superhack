import React, { useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import addresses from "../utils/addresses";
import { createWalletClient, custom } from "viem";
import { baseSepolia } from "viem/chains";

const Trade: React.FC = () => {
  const escrowContractAddress = addresses.escrow;

  return (
    <div>
      <p>Trade Here</p>
    </div>
  );
};

export default Trade;
