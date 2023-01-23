//Nice to have proper validations, but for demo it's fine.

import { BigNumber } from "ethers";
import { useEffect, useState } from "react";
import { useSignTypedData, useNetwork } from "wagmi";

const tokenAddress = import.meta.env.VITE_TOKEN;
const relayerAddress = import.meta.env.VITE_RELAYER;

interface SignDataButtonProps {
  tokenBalance: BigNumber;
  nonce: BigNumber;
  walletAddress?: `0x${string}`;
}

export const SignDataButton = ({
  tokenBalance,
  walletAddress,
  nonce,
}: SignDataButtonProps) => {
  const { chain } = useNetwork();
  const [amount, setAmount] = useState("0");

  const domain = {
    name: "DemoToken",
    version: "1",
    chainId: chain?.id,
    verifyingContract: tokenAddress as `0x${string}`,
  } as const;

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  } as const;

  //Hardcoded 100 blocks for simplicity
  const deadline = BigNumber.from(Math.floor(Date.now() / 1000) + 50000);

  const { signTypedData } = useSignTypedData({
    domain,
    types,
    value: {
      owner: walletAddress as `0x${string}`,
      spender: relayerAddress as `0x${string}`,
      value:
        amount && !isNaN(+amount) ? BigNumber.from(amount) : BigNumber.from(0),
      nonce,
      deadline,
    },
    async onSuccess(data) {
      const response = await fetch("http://127.0.0.1:3000/deposit", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signedData: data,
          walletAddress,
          value: amount,
          deadline: deadline.toString(),
          nonce: nonce.toString(),
        }),
      });

      if (response.status !== 200) {
        console.log("oops, something went wrong");
      }
    },
  });

  const handleChangeAmount = (e: React.FormEvent<HTMLInputElement>) => {
    setAmount(e.currentTarget.value);
  };

  const signData = () => {
    if (!tokenBalance || !amount) {
      return;
    }
    if ((tokenBalance as BigNumber).gte(BigNumber.from(amount))) {
      signTypedData();
    }
  };

  return (
    <>
      <div className="nes-field">
        <label>
          Amount to transfer:
          <input
            type="text"
            value={amount}
            onChange={handleChangeAmount}
            className="nes-input"
          />
        </label>
      </div>
      <button type="button" className="nes-btn is-primary" onClick={signData}>
        Sign Data
      </button>
    </>
  );
};
