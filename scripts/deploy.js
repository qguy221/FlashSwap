const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  const FlashSwapArbAgent = await ethers.getContractFactory('FlashSwapArbAgent');
  // Replace with actual addresses
  const flashLoanProvider = '0x0000000000000000000000000000000000000000';
  const aiAgent = deployer.address; // Or actual AI agent address
  const contract = await FlashSwapArbAgent.deploy(flashLoanProvider, aiAgent);

  await contract.deployed();
  console.log('FlashSwapArbAgent deployed to:', contract.address);

  // Update config.json with deployed address (manual for now)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });