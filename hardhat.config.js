require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://172.20.10.5:8545",
      chainId: 1337
    }
  },
  paths: {
    artifacts: "./client/src/artifacts",
  }
};
