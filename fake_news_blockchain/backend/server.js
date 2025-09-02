const express = require("express");
const cors = require("cors");
const Web3 = require("web3");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const NEWS_API_URL = `https://newsapi.org/v2/everything?q=stock%20market%20OR%20finance%20OR%20Nifty50%20OR%20Sensex%20OR%20S&P500%20OR%20NASDAQ%20OR%20DowJones%20OR%20GoldmanSachs%20OR%20MorganStanley%20OR%20JP%20Morgan%20OR%20Deloitte&language=en&sortBy=publishedAt&pageSize=100&apiKey=18a87f17ef6645f69c5f4c5202f8fadb`;
const CONTRACT_ADDRESS = "0x6779e8c6F659B28701b83F7cA33C1E7d3d9E2d17";
const PRIVATE_KEY ="4896a66ec8c969fd5834b3cfdf1b81ea062ec9ddc92308211e5e2352b13ab4a3";
const INFURA_URL = "https://eth-sepolia.g.alchemy.com/v2/6u7ET674Owl43opQSo0RlEb6MVb4cZKZ";

app.use(cors());
app.use(express.json());

// Initialize Web3 & Smart Contract
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));
const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "headline",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "url",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "reporter",
          "type": "address"
        }
      ],
      "name": "NewsReported",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "voter",
          "type": "address"
        }
      ],
      "name": "NewsVoted",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_newsId",
          "type": "uint256"
        }
      ],
      "name": "getNews",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasVoted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "newsCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "newsReports",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "headline",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "url",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "reporter",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "votes",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_headline",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_url",
          "type": "string"
        }
      ],
      "name": "reportFakeNews",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "reputation",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_newsId",
          "type": "uint256"
        }
      ],
      "name": "voteFakeNews",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(account);

// Fetch latest news from NewsAPI
app.get("/news", async (req, res) => {
  try {
    const response = await axios.get(NEWS_API_URL);
    res.json(response.data.articles);
  } catch (error) {
    res.status(500).json({ error: "Error fetching news" });
  }
});

// Report fake news (store on Blockchain)
app.post("/report", async (req, res) => {
  const { headline, url } = req.body;
  if (!headline || !url) return res.status(400).json({ error: "Missing fields" });

  try {
    // Send transaction to smart contract
    const tx = contract.methods.reportFakeNews(headline, url);
    const gas = await tx.estimateGas({ from: account.address });
    const data = tx.encodeABI();
    const signedTx = await web3.eth.accounts.signTransaction(
      { to: CONTRACT_ADDRESS, data, gas, from: account.address },
      PRIVATE_KEY
    );
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.json({ message: "News reported successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error reporting fake news" });
  }
});

// Fetch all reported fake news from Blockchain
app.get("/reported-news", async (req, res) => {
  try {
    const count = await contract.methods.newsCount().call();
    const reports = [];

    for (let i = 0; i < count; i++) {
      const news = await contract.methods.getNews(i).call();
      reports.push({
        id: news[0],
        headline: news[1],
        url: news[2],
        reporter: news[3],
        votes: news[4]
      });
    }
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Error fetching reported news" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
