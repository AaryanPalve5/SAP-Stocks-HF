import React, { useState, useEffect } from "react";
import "./styles.css"; // Import the CSS file

// Hardcoded Button Component
const Button = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        display: "block",
        margin: "0 auto",
      }}
    >
      {children}
    </button>
  );
};

// Hardcoded CardContent Component
const CardContent = ({ children }) => {
  return <div style={{ padding: "10px 0" }}>{children}</div>;
};

// Modal Component for Quantity Input
const QuantityModal = ({ stock, action, onConfirm, onClose }) => {
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    if (quantity > 0) {
      onConfirm(quantity);
      onClose();
    } else {
      alert("Please enter a valid quantity.");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          width: "300px",
        }}
      >
        <h3 className="font-semibold text-center">{action === "buy" ? "Buy" : "Sell"} {stock.name}</h3>
        <p className="text-center">Price: ${stock.price.toFixed(2)}</p>
        <input
          type="number"
          placeholder="Enter quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
          style={{
            padding: "10px",
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ddd",
            marginBottom: "20px",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button onClick={handleConfirm}>Confirm</Button>
          <Button onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default function StockMarket() {
  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(100000);
  const [profitLoss, setProfitLoss] = useState(0);
  const [stocks, setStocks] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState(null);
  const [modalAction, setModalAction] = useState("buy");

  // Fetch stock data from the backend
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/stocks");
        const data = await response.json();
        console.log("Fetched stocks:", data); // Log fetched data
        setStocks(data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };
    fetchStocks();
  }, []);

  const buyStock = (stock, quantity) => {
    const totalCost = stock.price * quantity;
    if (balance < totalCost) {
      alert("Insufficient balance to complete the purchase.");
      return;
    }

    setBalance(balance - totalCost);
    setPortfolio((prevPortfolio) => {
      const existingStock = prevPortfolio.find((s) => s.symbol === stock.symbol);
      if (existingStock) {
        return prevPortfolio.map((s) =>
          s.symbol === stock.symbol ? { ...s, quantity: s.quantity + quantity } : s
        );
      } else {
        return [...prevPortfolio, { ...stock, quantity }];
      }
    });
    addTransactionHistory("Buy", stock, quantity);
  };

  const sellStock = (stock, quantity) => {
    const existingStock = portfolio.find((s) => s.symbol === stock.symbol);
    if (!existingStock || existingStock.quantity < quantity) {
      alert("You do not have enough shares to sell.");
      return;
    }

    setPortfolio((prevPortfolio) => {
      return prevPortfolio
        .map((s) =>
          s.symbol === stock.symbol && s.quantity > quantity
            ? { ...s, quantity: s.quantity - quantity }
            : s.symbol === stock.symbol
            ? null
            : s
        )
        .filter(Boolean);
    });
    setBalance(balance + stock.price * quantity);
    addTransactionHistory("Sell", stock, quantity);
  };

  const addTransactionHistory = (action, stock, quantity) => {
    const newTransaction = {
      action,
      name: stock.name,
      symbol: stock.symbol,
      price: stock.price,
      quantity,
      total: stock.price * quantity,
      timestamp: new Date().toLocaleString(),
    };
    setTransactionHistory((prevHistory) => [...prevHistory, newTransaction]);
  };

  const calculateProfitLoss = () => {
    let totalPL = 0;
    portfolio.forEach((stock) => {
      const currentPrice = stocks.find((s) => s.symbol === stock.symbol)?.price || stock.price;
      totalPL += (currentPrice - stock.price) * stock.quantity;
    });
    setProfitLoss(totalPL);
  };

  useEffect(() => {
    calculateProfitLoss();
  }, [portfolio, stocks]);

  // Filter stocks based on search query
  const filteredStocks = searchQuery
    ? stocks.filter((stock) =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : stocks.slice(0, 5); // Display only the first 5 stocks initially

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <h1 className="text-xl font-bold text-center">Dummy Stock Trading</h1>
      <h2 className="text-lg text-center">Balance: ${balance.toFixed(2)}</h2>
      <h2 className={`text-lg text-center ${profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
        Profit/Loss: ${profitLoss.toFixed(2)}
      </h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search for a stock..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          borderRadius: "5px",
          border: "1px solid #ddd",
          marginBottom: "20px",
        }}
      />

      {/* Flex container for stock cards */}
      {/* Flex container for stock cards */}
<div className="stock-container">
  {filteredStocks.map((stock) => (
    <div key={stock.symbol} className="stock-card">
      <CardContent>
        <h3 className="font-semibold text-center">{stock.name} ({stock.symbol})</h3>
        <p className="text-center">Price: ${stock.price.toFixed(2)}</p>
        <p className="text-center">
          Sentiment: <span 
            style={{ 
              color: stock.sentiment === "Positive" ? "green" : 
                     stock.sentiment === "Negative" ? "red" : "gray" 
            }}>
            {stock.sentiment}
          </span>
        </p>
        <Button onClick={() => { setSelectedStock(stock); setModalAction("buy"); }}>
          Buy
        </Button>
      </CardContent>
    </div>
  ))}
</div>


      {/* Quantity Modal */}
      {selectedStock && (
        <QuantityModal
          stock={selectedStock}
          action={modalAction}
          onConfirm={(quantity) => {
            if (modalAction === "buy") {
              buyStock(selectedStock, quantity);
            } else {
              sellStock(selectedStock, quantity);
            }
          }}
          onClose={() => setSelectedStock(null)}
        />
      )}

      <h2 className="text-lg mt-4 text-center">Portfolio</h2>
      <div className="stock-container">
        {portfolio.map((stock) => (
          <div key={stock.symbol} className="stock-card">
            <CardContent>
              <h3 className="font-semibold text-center">{stock.name}</h3>
              <p className="text-center">Price: ${stock.price.toFixed(2)}</p>
              <p className="text-center">Quantity: {stock.quantity}</p>
              <Button className="mt-2" onClick={() => { setSelectedStock(stock); setModalAction("sell"); }}>
                Sell
              </Button>
            </CardContent>
          </div>
        ))}
      </div>

      <h2 className="text-lg mt-4 text-center">Transaction History</h2>
      <div className="max-h-60 overflow-y-auto w-full px-4">
        {transactionHistory.length === 0 ? (
          <p className="text-center">No transactions yet.</p>
        ) : (
          transactionHistory.map((transaction, index) => (
            <div key={index} className="flex justify-between border-b p-2">
              <span>
                {transaction.action} {transaction.name} ({transaction.symbol}) - {transaction.quantity} shares
              </span>
              <span>${transaction.total.toFixed(2)} - {transaction.timestamp}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}