import { SignDataButton } from "../signDataButton/signDataButton";
import tokenABI from "../../assets/tokenABI.json";
import { BigNumber } from "ethers";
import { useAccount, useContractRead } from "wagmi";

export const DepositContainer = () => {
  const tokenAddress = import.meta.env.VITE_TOKEN;

  const { address } = useAccount();

  const { data } = useContractRead({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  const { data: nonce } = useContractRead({
    address: tokenAddress,
    abi: tokenABI,
    functionName: "nonces",
    args: [address],
    watch: true,
  });

  const tokenOwnerNonce = nonce ? (nonce as BigNumber) : BigNumber.from(0);

  const tokenBalance = data ? (data as BigNumber) : BigNumber.from(0);
  return (
    <div className="app-container">
      <div className="balance">{`Your balance: ${tokenBalance}`}</div>
      <SignDataButton
        walletAddress={address}
        tokenBalance={tokenBalance}
        nonce={tokenOwnerNonce}
      />
    </div>
  );
};
