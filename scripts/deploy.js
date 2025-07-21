const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  // Deploy MockERC20
  const MockERC20 = await ethers.getContractFactory('MockERC20');
  const mockToken = await MockERC20.deploy('Mock Token', 'MTK');
  await mockToken.waitForDeployment();
  console.log('MockERC20 deployed to:', mockToken.target);

  // Deploy FlashSwapArbAgent
  const FlashSwapArbAgent = await ethers.getContractFactory('FlashSwapArbAgent');
  // Replace with actual addresses if available
  const flashLoanProvider = '0x0000000000000000000000000000000000000000'; // Placeholder
  const aiAgent = deployer.address; // Using deployer as placeholder
  const arbAgent = await FlashSwapArbAgent.deploy(flashLoanProvider, aiAgent);
  await arbAgent.waitForDeployment();
  console.log('FlashSwapArbAgent deployed to:', arbAgent.target);

  // Deploy FlashSwapVault
  const FlashSwapVault = await ethers.getContractFactory('FlashSwapVault');
  const vault = await FlashSwapVault.deploy(mockToken.target, 'FlashSwap Vault', 'FSV', arbAgent.target);
  await vault.waitForDeployment();
  console.log('FlashSwapVault deployed to:', vault.target);

  // Update config.json with deployed addresses (manual for now)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });