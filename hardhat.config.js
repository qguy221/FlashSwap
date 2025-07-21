require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

let privateKey = process.env.PRIVATE_KEY || '';
if (!privateKey.startsWith('0x')) {
  privateKey = '0x' + privateKey;
}

module.exports = {
  solidity: '0.8.28',
  networks: {
    hardhat: {},
    sei: {
      url: "https://evm-rpc-testnet.sei-apis.com",
      chainId: 1328,
      accounts: privateKey ? [privateKey] : []
    }
  }
};