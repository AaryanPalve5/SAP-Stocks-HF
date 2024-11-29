// pages/api/stock.js
import axios from "axios";

export default async function handler(req, res) {
    const { symbol } = req.query; // Get the stock symbol from the query parameter
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
    
    try {
        const response = await axios.get(url);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response ? error.response.status : 500).json({ error: "Failed to fetch stock data" });
    }
}
