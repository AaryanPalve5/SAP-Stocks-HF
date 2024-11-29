"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { features } from "@/data/features"; // Ensure you have this file or modify as needed
import axios from "axios"; // Make sure to install axios with `npm install axios`
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"; // Import Recharts components

export default function Home() {
    const [stockSymbol, setStockSymbol] = useState("");
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [historicalPrices, setHistoricalPrices] = useState([]); // State for historical data
    const [sentimentAnalysisResults, setSentimentAnalysisResults] = useState<any>(null); // State for sentiment data

    // Chatbot states
    const [userMessage, setUserMessage] = useState("");
    const [chatbotResponse, setChatbotResponse] = useState<any>(null);
    const [loadingChatbot, setLoadingChatbot] = useState(false);

    const fetchStockData = async () => {
        setLoading(true);
        setErrorMessage(""); // Reset error message
        try {
            // Fetch latest stock price
            const stockResponse = await axios.get(`http://127.0.0.1:5000/api/stock?symbol=${stockSymbol}`);
            const price = stockResponse.data.currentPrice; // Get the latest closing price
            setCurrentPrice(price);

            // Fetch historical data (for example, last 30 days)
            const historicalResponse = await axios.get(`http://127.0.0.1:5000/stock_data/${stockSymbol}`); // Update your API endpoint as needed
            const historicalPricesData = historicalResponse.data.values.map((value, index) => ({
                name: `Day ${index + 1}`, // Replace with actual date if available
                price: value,
            }));
            setHistoricalPrices(historicalPricesData);

            // Fetch sentiment data
            const sentimentResponse = await axios.post(`http://127.0.0.1:5000/api/sentiments`, {
                symbol: stockSymbol, // Include the symbol if needed
            });
            setSentimentAnalysisResults(sentimentResponse.data);
            console.log("Sentiment Scores:", sentimentResponse.data); // Print sentiment scores

        } catch (error) {
            console.error("Error fetching stock price:", error);
            setErrorMessage("Error fetching stock price. Please check the symbol.");
            setCurrentPrice(null);
            setSentimentAnalysisResults(null);
        } finally {
            setLoading(false);
        }
    };
    
    // Function to format the response text
    const formatResponse = (text) => {
        text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        text = text.replace(/\*\*\*(.*?)\*\*\*/g, "<em><strong>$1</strong></em>");
        text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
        text = text.replace(/\n/g, "<br />");
        return text;
    };

    // Fetch chatbot response
    const fetchChatbotResponse = async () => {
        setLoadingChatbot(true);
        try {
            // Send only the user's message as the question to the chatbot API
            const response = await axios.post(`http://127.0.0.1:5000/api/chatbot`, {
                question: userMessage, // Change to 'question' to match expected input structure
            });
            setChatbotResponse(response.data.response); // Assuming the response is structured accordingly
        } catch (error) {
            console.error("Error fetching chatbot response:", error);
            setChatbotResponse("Error fetching chatbot response. Please try again.");
        } finally {
            setLoadingChatbot(false);
        }
    };
    

    return (
        <>
            <div className="border-b border-border">
                <main className="container mx-auto">
                    <div className="relative md:mt-24 mx-auto w-full max-w-4xl pt-4 text-center">
                        <div className="justify-center hidden md:flex">
                            <div className="flex flex-row items-center justify-center gap-5 p-1 text-xs bg-card/60 backdrop-blur-lg rounded-md border border-border">
                                <Badge className="font-semibold">New</Badge>
                                <h5>Announce your new feature here</h5>
                                <Link href="/" className="flex flex-row items-center">
                                    View all features
                                    <ArrowRightIcon className="w-6 h-6 ml-2" />
                                </Link>
                            </div>
                        </div>
                        <h1 className="md:text-7xl my-4 font-extrabold text-4xl md:leading-tight">SAP Stock!</h1>
                        <p className="mx-auto my-4 text-sm w-full max-w-xl text-center font-medium leading-relaxed tracking-wide">
                            Welcome to SAP Stock 
                        </p>

                        <div className="flex flex-row justify-center items-center space-x-4 my-8">
                            <Button>
                                Get Started
                            </Button>
                            <Button variant="secondary">
                                Learn More
                            </Button>
                        </div>

                        <div className="absolute top-0 -z-10 max-h-full max-w-screen-lg w-full h-full blur-2xl">
                            <div className="absolute top-24 left-24 w-56 h-56 bg-violet-600 rounded-full mix-blend-multiply opacity-70 animate-blob filter blur-3xl"></div>
                            <div className="absolute hidden md:block bottom-2 right-1/4 w-56 h-56 bg-sky-600 rounded-full mix-blend-multiply opacity-70 animate-blob delay-1000 filter blur-3xl"></div>
                            <div className="absolute hidden md:block bottom-1/4 left-1/3 w-56 h-56 bg-pink-600 rounded-full mix-blend-multiply opacity-70 animate-blob delay-500 filter blur-3xl"></div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto mb-8">
                        <Image className="w-full" src="/dashboard-ui.png" alt="Dashboard ui design" priority width={1200} height={800} />
                    </div>
                </main>
            </div>

            {/* features */}
            <section className="border-b border-border bg-gradient-to-b from-background to-transparent via-background via-90% relative">
                <div className="container mx-auto text-center">
                    <div className="my-24">
                        <h5 className="text-primary">WHY CHOOSE US</h5>
                        <h2 className="text-4xl font-extrabold my-4">Grow your portfolio with us</h2>
                        <p className="mx-auto my-4 text-sm w-full max-w-md bg-transparent text-center font-medium leading-relaxed tracking-wide text-muted-foreground">
                            Our services are here to cater to your needs.
                        </p>

                        <div className="flex flex-col md:flex-row gap-4 mt-12">
                            {features.map((feature) => (
                                <Card key={feature.title} className="max-w-lg mx-auto">
                                    <CardHeader>
                                        <div className="w-16 h-16 text-primary-foreground flex justify-center items-center border border-border rounded-xl bg-primary mx-auto">
                                            {feature.icon}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardTitle>{feature.title}</CardTitle>
                                        <CardDescription className="mt-4">
                                            {feature.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 -z-10 max-h-full w-full h-full blur-2xl">
                    <div className="absolute bottom-0 left-0 w-1/2 h-56 bg-violet-600 rounded-full mix-blend-multiply opacity-70 animate-blob filter blur-3xl"></div>
                    <div className="absolute top-24 right-0 w-1/2 h-56 bg-sky-600 rounded-full mix-blend-multiply opacity-70 animate-blob delay-1000 filter blur-3xl"></div>
                </div>
            </section>

            {/* Stock Price Input and Line Chart Section */}
            <div className="flex flex-col items-center my-8" id="services">
            <h1 className="text-5xl mb-4 font-extrabold text-primary">Enter Stock Ticker </h1>
   
                <input
                    type="text"
                    placeholder="Enter stock symbol (e.g., AAPL)"
                    value={stockSymbol}
                    onChange={(e) => setStockSymbol(e.target.value)}
                    className="border rounded p-2"
                />
                <Button onClick={fetchStockData} className="mt-2" disabled={loading}>
                    {loading ? "Fetching..." : "Get Insights"}
                </Button>
                {/* Display Stock Price */}
                {currentPrice !== null && (
                    <p className="mt-4 text-lg">
                        Latest Closing Price: ${currentPrice.toFixed(2)}
                    </p>
                )}
                {errorMessage && <p className="mt-4 text-red-500">{errorMessage}</p>}

                {/* Display Historical Price Line Chart */}
                {historicalPrices.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={historicalPrices}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="price" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                )}

                {/* Empty half-page space for future content */}
                <div className="h-[20vh]"></div>

                {/* Display Sentiment Analysis Results */}
                {sentimentAnalysisResults && (
    <div className="mt-4" id="about">
        <h3 className="text-3xl mb-4 font-extrabold text-primary">Sentiment Analysis Results</h3>
                    
        <table className="min-w-full border border-gray-300">
            <thead>
                <tr>
                    <th className="border border-gray-300 px-4 py-2">Link</th>
                    <th className="border border-gray-300 px-4 py-2">Sentiment</th>
                </tr>
            </thead>
            <tbody>
                {sentimentAnalysisResults.links && sentimentAnalysisResults.links.length > 0 && 
                    sentimentAnalysisResults.links.map((link, index) => (
                        <tr key={index}>
                            <td className="border border-gray-300 px-4 py-2">
                                <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                    {link}
                                </a>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                                {sentimentAnalysisResults.sentiments[index]?.label}
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    </div>
)}

            </div>

            {/* Chatbot Section */}
            {/* AI Chatbot Section (Only shows after stock data is fetched) */}
            {currentPrice !== null && sentimentAnalysisResults && (
                <div className="flex flex-col items-center my-8 bg-gradient-to-b from-background to-muted-foreground rounded-lg p-6 shadow-lg">
                    <h3 className="text-3xl mb-4 font-extrabold text-primary">Ask Our AI Chatbot</h3>
                    <p className="text-sm mb-4 max-w-md text-center text-muted-foreground">
                        Have any questions about stock prices or the market? Our AI chatbot is here to help. Just type your question below.
                    </p>
                    <textarea
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        placeholder="Ask me anything..."
                        className="w-full md:w-3/4 p-4 rounded-md border border-border bg-muted/90 text-white placeholder-white focus:ring-2 focus:ring-primary focus:outline-none mb-4"
                        rows={4}
                    />
                    <Button onClick={fetchChatbotResponse} className="mt-2" disabled={loadingChatbot}>
                        {loadingChatbot ? "Thinking..." : "Send"}
                    </Button>

                    {chatbotResponse && (
                        <div className="mt-4 w-full md:w-3/4 p-4 rounded-lg bg-card text-primary-foreground shadow-md">
                            <h4 className="font-bold text-lg">Chatbot Response:</h4>
                            <p className="mt-2 text-muted-foreground" dangerouslySetInnerHTML={{ __html: formatResponse(chatbotResponse) }} />
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
