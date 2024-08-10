import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const baseSepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http(
    "https://base-sepolia.g.alchemy.com/v2/lGvbdTFmVDg8Sdn-1k14Rta6caJcWkfD"
  ),
});

export default baseSepoliaClient;
