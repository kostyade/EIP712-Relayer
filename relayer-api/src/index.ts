import 'dotenv/config';

import express from 'express';
import helmet from 'helmet';
import { ethers, TypedDataField } from 'ethers';

const domain = {
  name: 'Demo Relayer',
  version: '1',
  chainId: 1337,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
} as const;

const types = {
  Token: [{ name: 'amount', type: 'string' }]
} as Record<string, TypedDataField[]>;

//hardcoded for simplicity
const gasPerTransaction = 50000;

const gasLimitPerPeriod = 500000;

(async () => {
  const queue = [];
  const maxBatchSize = Math.floor(gasLimitPerPeriod / gasPerTransaction);
  //const provider = new ethers.providers.JsonRpcProvider('http://0.0.0.0:8545');
  //const private_key = process.env.PRIVATE_KEY;

  const address = ethers.utils.verifyTypedData(
    domain,
    types,
    { amount: '123' },
    '0xd81433fa38fa0bade9cedcb051e63db310d4776ed2c4721056b2753f212d47a7035b0a691c6a2ddc91c8fce523ffbc68a3646fd2d65ca1536f04e35c1bba70a81b'
  );

  const app = express();
  app.use(helmet());
  app.use(express.json());
})();
