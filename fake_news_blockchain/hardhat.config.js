require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.0",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/6u7ET674Owl43opQSo0RlEb6MVb4cZKZ",
      accounts: ["4896a66ec8c969fd5834b3cfdf1b81ea062ec9ddc92308211e5e2352b13ab4a3"],
    }
  }
};
