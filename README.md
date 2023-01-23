# EIP712 Relayer Service with batch transactions

Proof of Concept of simpke relayer service that batches user submitted transactions
and submit multiple transactions in one meta-transaction.

## Contents

- [Intro](#bookmark_tabs-introduction)
- [Contracts](#sparkles-contracts)
- [API](#sparkles-API)
- [UI](#sparkles-UI)
- [Nice to have](#see_no_evil-nice-to-have)

## :bookmark_tabs: Introduction

Relayer Service consist of three modules, simple React based UI, NodeJS api layer to batch, verify and send meta transactions, and two smart contracts Relayer and extended ERC-20 Token.

## :sparkles: contracts

**ERC20 Permit Token** ERC-20 token extended with EIP712 validation and permit method to allow meta transactions
**Relayer** simple relayer with EIP712 verification and deposit/batchDeposit methods. ERC20 rejections won't cause batch transaction to revert, to track success/failure user need to look into txlogs, there are TransferSuccess/TransferFailed events.

- `cd relayer-contracts`
- `yarn`
- `npx hardhat npx hardhat node`
- `npx hardhat run --network localhost scripts/deploy.js`
  for tests
- `npx hardhat test`

## :sparkles: API

Simple node/express application with single endpoint. For simplicity queues are handled inside of the service, though it's nice to separate them.
Test private key and contracts addresses are in .env.
Please make sure you have hardhat node running with contracts deployed.

- `cd relayer-api`
- `yarn`
- `yarn start:dev`

## :sparkles: UI

UI module uses React with Vite as bundler and yarn as package manager. Localhost contract are hardcoded into .env for. simpllicity.
Please make sure hardhat local node is running and you have localhost network and test accounts added in your Metamask. Relayer api service is also need to be up and running.

Hardhat test wallets with pre minted test ERC-20 tokens:

Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

- `cd relayer-ui`
- `yarn`
- `yarn dev`

## :see_no_evil: Nice to have

**UI** lacks proper validations, RPC requests can be optimised further, but basic functionality is there

**API** needs separate handler for scheduling and handling batches, needsto track tx logs to see which transactions are TransferFailed

**Contracts** there are definitely things to improve, reentrancy guard, gas optimizations, but in terms of Proof of Concept it works

## :notebook: References

https://eips.ethereum.org/EIPS/eip-712
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/metatx/MinimalForwarder.sol
https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/IERC20Permit.sol
https://github.com/0xProject/exchange-v3/blob/aae46bef841bfd1cc31028f41793db4fe7197084/docs/advanced/mtx.rst
https://github.com/Uniswap/v2-core/blob/master/contracts/UniswapV2ERC20.sol
