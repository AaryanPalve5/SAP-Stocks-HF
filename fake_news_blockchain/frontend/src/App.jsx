import { useState, useEffect } from "react";
import Web3 from "web3";

// API and Contract Constants
const NEWS_API_URL = "https://newsapi.org/v2/everything?q=stock%20market%20OR%20finance%20OR%20Nifty50%20OR%20Sensex%20OR%20S&P500%20OR%20NASDAQ%20OR%20DowJones%20OR%20GoldmanSachs%20OR%20MorganStanley%20OR%20JP%20Morgan%20OR%20Deloitte&language=en&sortBy=publishedAt&pageSize=100&apiKey=18a87f17ef6645f69c5f4c5202f8fadb";
const contractAddress = "0x6779e8c6F659B28701b83F7cA33C1E7d3d9E2d17";
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



// Component: Navbar with Logo
function Navbar({ account, connectWallet }) {
  return (
    <div className=" border-b bg-black border-gray-700 py-4">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
          <div className="mr-4">
  <img src="/LOGO.jpg" alt="Logo" className="h-14 w-auto" />
</div>

           
          </div>

         
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <p className="text-xs text-gray-400 mb-1">Wallet Status</p>
              <p className="font-mono text-xs truncate max-w-xs">
                {account ? 
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2 inline-block"></span>
                    {account.substring(0, 6)}...{account.substring(account.length - 4)}
                  </span> : 
                  <span className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2 inline-block"></span>
                    Not Connected
                  </span>
                }
              </p>
            </div>
            <button 
              onClick={connectWallet} 
              className={`${account ? 'bg-green-600 hover:bg-green-700' : 'bg-pink-500 hover:bg-pink-700'} text-white px-3 py-2 rounded-md transition-colors duration-300 text-sm font-medium`}
            >
              {account ? "Connected" : "Connect Wallet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component: Card
function Card({ children, appear = false }) {
  return (
    <div className={`p-4 border border-gray-700 rounded-lg shadow-lg bg-gray-800 transition-all duration-300 transform ${appear ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} hover:scale-105`}>
      {children}
    </div>
  );
}

// Component: CardContent
function CardContent({ children }) {
  return <div className="p-2">{children}</div>;
}

// Component: SearchBar
function SearchBar({ searchQuery, handleSearchChange }) {
  return (
    <div className="relative mb-6">
      <input 
        type="text" 
        placeholder="Search news..." 
        value={searchQuery} 
        onChange={handleSearchChange} 
        className="w-full p-3 pl-10 bg-gray-800 border border-gray-700 rounded-4xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100"
      />
      <svg className="absolute left-3 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}

// Component: NewsCard
function NewsCard({ news, reportFakeNews, appear }) {
  return (
    <Card appear={appear}>
      <CardContent>
        <div className="mb-3">
          <p className="font-bold text-lg mb-2 text-white">{news.title}</p>
          <p className="text-gray-400 text-sm mb-2 line-clamp-2">{news.description || "No description available"}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>{news.source?.name || "Unknown source"}</span>
          <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-col gap-2">
          <a 
            href={news.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:text-blue-300 text-sm truncate transition-colors duration-300"
          >
            View Original Article
          </a>
          <button
            onClick={() => reportFakeNews(news.title, news.url)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-300 text-sm font-medium flex items-center justify-center"
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report as Fake
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// Component: LoadingSpinner
function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

// Component: NoResults
function NoResults() {
  return (
    <div className="bg-gray-800 rounded-lg p-8 text-center">
      <p className="text-gray-400">No news articles found matching your search.</p>
    </div>
  );
}

// Component: Footer
function Footer() {
  return (
    <footer className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
      <p>Blockchain Fake News Reporting Platform © 2025</p>
    </footer>
  );
}

// Main Component
export default function FakeNewsApp() {
  // State Management
  const [account, setAccount] = useState(null);
  const [news, setNews] = useState([]);
  const [reportedNews, setReportedNews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('latest'); // 'latest' or 'reported'

  // Effects
  useEffect(() => {
    connectWallet();
    fetchNews();
    fetchReportedNews();
  }, []);

  useEffect(() => {
    // Trigger the animation after data is loaded
    if (news.length > 0 && !cardsVisible) {
      setIsLoading(false);
      setTimeout(() => setCardsVisible(true), 300);
    }
  }, [news]);

  // Functions
  async function connectWallet() {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);
    } else {
      alert("Please install MetaMask!");
    }
  }

  async function fetchNews() {
    try {
      const response = await fetch(NEWS_API_URL);
      const data = await response.json();
      setNews(data.articles);
    } catch (error) {
      console.error("Error fetching news:", error);
      setIsLoading(false);
    }
  }

  async function reportFakeNews(headline, url) {
    if (!account) return alert("Connect MetaMask first");
    const web3 = new Web3(window.ethereum);
    const contract = new web3.eth.Contract(contractABI, contractAddress);
    await contract.methods.reportFakeNews(headline, url).send({ from: account });
    alert("News reported successfully!");
    fetchReportedNews();
  }

  async function fetchReportedNews() {
    try {
      // In a real implementation, you would fetch the reported news from the blockchain
      setReportedNews([]);
    } catch (error) {
      console.error("Error fetching reported news:", error);
    }
  }

  function handleSearchChange(event) {
    setSearchQuery(event.target.value);
  }

  // Filter news based on search query
  const filteredNews = news.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-black text-gray-100 min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar account={account} connectWallet={connectWallet} />

      <h2 className="text-7xl mt-5 font-bold text-center mb-2 bg-gradient-to-r from-violet-600 via-sky-600 to-blue-600 bg-clip-text text-transparent">
  Blockchain Fake News Reporting
</h2>
<p className="text-gray-400 text-sm mt-2 mb-5 text-center">Verify And Report Misleading Information Using The Blockchain.</p>

      
      {/* Main Content */}
      <div className="container mx-auto p-6 max-w-4xl flex-grow">
        {/* App Header */}
      
        
        {/* Mobile Wallet Status (visible only on small screens) */}
        <div className="md:hidden bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <div>
            <p className="text-sm text-gray-400 mb-1">Wallet Status</p>
            <p className="font-mono text-xs truncate max-w-xs">
              {account ? 
                <span className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2 inline-block"></span>
                  {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </span> : 
                <span className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-2 inline-block"></span>
                  Not Connected
                </span>
              }
            </p>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="flex border-b border-gray-700 mb-6">
          <button
            className={`pb-2 px-4 text-sm font-medium ${activeTab === 'latest' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('latest')}
          >
            Latest News
          </button>
          <button
            className={`pb-2 px-4 text-sm font-medium ${activeTab === 'reported' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
            onClick={() => setActiveTab('reported')}
          >
            Reported Fake News
          </button>
        </div>
        
        {/* Search Bar */}
        <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange} />
        
        {/* News Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-200">
            {activeTab === 'latest' ? 'Latest News' : 'Reported Fake News'}
          </h2>
          <div className="text-sm text-gray-400">
            {activeTab === 'latest' ? `${filteredNews.length} articles found` : `${reportedNews.length} reports found`}
          </div>
        </div>
        
        {/* News Content */}
        {activeTab === 'latest' && (
          isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {filteredNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNews.map((n, index) => (
                    <NewsCard 
                      key={index} 
                      news={n} 
                      reportFakeNews={reportFakeNews} 
                      appear={cardsVisible} 
                    />
                  ))}
                </div>
              ) : (
                <NoResults />
              )}
            </>
          )
        )}
        
        {/* Reported News Content (placeholder) */}
        {activeTab === 'reported' && (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">No reported fake news found. Report some news to see them here.</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}