require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

module.exports = {
  solidity: '0.8.28',
  networks: {
    sei: {
      url: process.env.SEI_RPC || 'https://sei-rpc.example.com',
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};