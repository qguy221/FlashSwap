require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: '0.8.28',
  networks: {
    hardhat: {},
    sei: {
      url: process.env.SEI_RPC || 'https://sei-rpc.example.com',
      accounts: []
    }
  }
};