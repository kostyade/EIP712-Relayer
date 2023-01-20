const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("TokenERC20Permit");
  token = await Token.deploy();
  await token.deployed();

  const Relayer = await hre.ethers.getContractFactory("Relayer");
  relayer = await Relayer.deploy();
  await relayer.deployed();

  [owner, alice, bob] = await ethers.getSigners();

  await token.mint(alice.address, 100);
  await token.mint(bob.address, 100);
  await token.mint(owner.address, 100);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
