const { ethers } = require("hardhat");
const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");

describe("Relayer", async function () {
  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  let token, relayer, currentBlock;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TokenERC20Permit");
    token = await Token.deploy();
    await token.deployed();

    const Relayer = await ethers.getContractFactory("Relayer");
    relayer = await Relayer.deploy();
    await relayer.deployed();

    currentBlock = await ethers.provider.getBlock("latest");
  });

  it("should work with valid signature", async function () {
    await token.mint(owner.address, 10);

    const DOMAIN_SEPARATOR = {
      name: "DemoToken",
      version: "1",
      chainId: hre.network.config.chainId,
      verifyingContract: token.address,
    };

    const nonce = await token.nonces(owner.address);

    const value = {
      owner: owner.address,
      spender: relayer.address,
      value: 10,
      nonce,
      deadline: 21674223853,
    };

    const signature = await owner._signTypedData(
      DOMAIN_SEPARATOR,
      types,
      value
    );

    await relayer.deposit(value, signature, token.address);

    const balance = await token.balanceOf(owner.address);

    expect(balance.toString()).to.equal("0");
  });
  it("should work with batch transactions", async function () {
    await token.mint(alice.address, 10);
    await token.mint(bob.address, 20);

    const DOMAIN_SEPARATOR = {
      name: "DemoToken",
      version: "1",
      chainId: hre.network.config.chainId,
      verifyingContract: token.address,
    };

    const nonceAlice = await token.nonces(alice.address);
    const nonceBob = await token.nonces(bob.address);

    const valueAlice = {
      owner: alice.address,
      spender: relayer.address,
      value: 10,
      nonce: nonceAlice,
      deadline: 21674223853,
    };

    const signatureAlice = await alice._signTypedData(
      DOMAIN_SEPARATOR,
      types,
      valueAlice
    );

    const valueBob = {
      owner: bob.address,
      spender: relayer.address,
      value: 20,
      nonce: nonceBob,
      deadline: 21674223853,
    };

    const signatureBob = await bob._signTypedData(
      DOMAIN_SEPARATOR,
      types,
      valueBob
    );

    //console.log(123, signature, owner.address);

    const tx = await relayer.batchDeposit(
      [valueAlice, valueBob],
      [signatureAlice, signatureBob],
      [token.address, token.address]
    );

    const balance = await token.balanceOf(relayer.address);

    expect(balance.toString()).to.equal("30");
  });
  it("should not allow wrong signature", async function () {
    await token.mint(owner.address, 10);

    const DOMAIN_SEPARATOR = {
      name: "DemoToken",
      version: "1",
      chainId: hre.network.config.chainId,
      verifyingContract: token.address,
    };

    const nonce = await token.nonces(owner.address);

    const value = {
      owner: owner.address,
      spender: relayer.address,
      value: 10,
      nonce,
      deadline: 21674223853,
    };

    const signature = await alice._signTypedData(
      DOMAIN_SEPARATOR,
      types,
      value
    );

    await expect(
      relayer.deposit(value, signature, token.address)
    ).to.be.revertedWith("signature does not match request");
  });
});
