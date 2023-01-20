//Nice to have proper validations, but for demo it's fine.

import { useState } from "react";
import { useSignTypedData } from "wagmi";

const domain = {
  name: "Demo Relayer",
  version: "1",
  chainId: 1337,
  verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
} as const;

const types = {
  Token: [{ name: "amount", type: "string" }],
} as const;

export const SignDataButton = () => {
  const [amount, setAmount] = useState("0");
  const { data, isError, isLoading, isSuccess, signTypedData } =
    useSignTypedData({
      domain,
      types,
      value: {
        amount,
      },
      onSuccess(data) {
        console.log("Success", data);
      },
    });

  const handleChangeAmount = (e: React.FormEvent<HTMLInputElement>) => {
    setAmount(e.currentTarget.value);
  };

  const signData = () => {
    signTypedData();
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
