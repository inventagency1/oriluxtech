require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    crestchain: {
      url: process.env.CRESTCHAIN_RPC_URL || "https://rpc.crestchain.pro",
      chainId: 85523,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto"
    }
  },
  etherscan: {
    apiKey: {
      crestchain: "no-api-key-needed"
    },
    customChains: [
      {
        network: "crestchain",
        chainId: 85523,
        urls: {
          apiURL: "https://scan.crestchain.pro/api",
          browserURL: "https://scan.crestchain.pro"
        }
      }
    ]
  }
};
