/**
 * @dev probably it would be nice to handle queue somewhere outside to not lose tx requests, but for PoC setInterval must be enough
 */

import 'dotenv/config';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { BigNumber, ethers } from 'ethers';
import tokenABI from './ABI/token.json';
import relayerABI from './ABI/relayer.json';

//hardcoded for simplicity
const gasPerTransaction = 200000;
const gasLimitPerPeriod = 1000000;
const interval = 10 * 1000;

//single token contract address is hardcoded, though POC supports multiple tokens transactions

(async () => {
  const port = process.env.PORT || 3000;

  const queue: {
    payloadValue: {
      owner: string;
      spender: string | undefined;
      value: BigNumber;
      nonce: BigNumber;
      deadline: BigNumber;
    };
    signedData: string;
    tokenAddress: string | undefined;
  }[] = [];
  const maxBatchSize = Math.floor(gasLimitPerPeriod / gasPerTransaction);

  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.listen(port, () => console.log(`listening at port ${port}`));

  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

  const signer = new ethers.Wallet(
    process.env.TEST_PRIVATE_KEY as string,
    provider
  );

  const tokenContract = new ethers.Contract(
    process.env.TOKEN_CONTRACT as string,
    tokenABI,
    provider
  );

  const relayerContract = new ethers.Contract(
    process.env.RELAYER_CONTRACT as string,
    relayerABI,
    signer
  );

  setInterval(async () => {
    try {
      if (queue.length > 0) {
        const batch = queue.splice(0, maxBatchSize);

        const requestsData: {
          owner: string;
          spender: string | undefined;
          value: BigNumber;
          nonce: BigNumber;
          deadline: BigNumber;
        }[] = [];
        const signedData: string[] = [];
        const tokenAddresses: (string | undefined)[] = [];

        batch.forEach((item) => {
          requestsData.push(item.payloadValue);
          signedData.push(item.signedData);
          tokenAddresses.push(item.tokenAddress);
        });

        const tx = await relayerContract.batchDeposit(
          requestsData,
          signedData,
          tokenAddresses,
          {
            gasLimit: gasPerTransaction * batch.length
          }
        );

        const receipt = await tx.wait();

        console.log(receipt);

        /**
         * Uncomment next block to debug failure logs
         */
        /*         let iface = new ethers.utils.Interface(relayerABI);

        receipt.logs.forEach((log: { topics: string[]; data: string }) => {
          console.log(iface.parseLog(log));
        }); */
      }
    } catch (error) {
      console.error(error, 'This should not happen, killing app((');
      process.exit(1);
    }
  }, interval);

  app.post<
    {},
    {},
    {
      signedData: string;
      walletAddress: string;
      value: string;
      deadline: string;
      nonce: string;
    },
    {}
  >('/deposit', async (req, res) => {
    try {
      console.log(req.body);
      const { signedData, walletAddress, value, nonce, deadline } = req.body;

      const payloadValue = {
        owner: walletAddress,
        spender: process.env.RELAYER_CONTRACT,
        value: BigNumber.from(value),
        nonce: BigNumber.from(nonce),
        deadline: BigNumber.from(deadline)
      };

      if (!signedData || !walletAddress) {
        throw new Error('wrong payload');
      }

      const balance = await tokenContract.balanceOf(walletAddress);
      if (BigNumber.from(value).gt(balance)) {
        throw new Error('not enough balance');
      }

      const nonceFromContract = await tokenContract.nonces(walletAddress);
      if (nonce !== nonceFromContract.toString()) {
        console.log(nonce, nonceFromContract.toString());
        throw new Error('nonces do not match');
      }

      if (Math.floor(Date.now() / 1000) > +deadline) {
        throw new Error('too late');
      }

      const isVerified: boolean = await relayerContract.verify(
        payloadValue,
        signedData,
        process.env.TOKEN_CONTRACT
      );
      if (!isVerified) {
        throw new Error('wrong signature');
      }

      const payload = {
        payloadValue,
        signedData,
        tokenAddress: process.env.TOKEN_CONTRACT
      };
      queue.push(payload);

      res.status(200).send('ok');
    } catch (error) {
      console.log(error);
      let errorMessage = 'Something went wrong';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).send({ error: errorMessage });
    }
  });
})();
