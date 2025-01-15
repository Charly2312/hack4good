import { useCallback, useState, useEffect } from "react";
import "./DailyReminder.css";

export default function DailyReminder() {
  const [quote, setQuote] = useState("Loading...");
  const categories = ["attitude", "dreams", "education", "experience", "failure", "happiness", "hope", "inspirational", "intelligence", "knowledge", "leadership", "learning", "life", "success"];

  const fetchQuote = useCallback(() => {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const url = `https://api.api-ninjas.com/v1/quotes?category=${randomCategory}`;
    const apiKey = "kThfHLjem77f3bYXul9irg==7Uqyldt3I71IMhMy"; // Replace with your API key

    fetch(url, {
      headers: {
        'X-Api-Key': apiKey,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.length > 0 && data[0].quote && data[0].author) {
          setQuote(`${data[0].quote} - ${data[0].author}`);
        } else {
          throw new Error("No quote data available");
        }
      })
      .catch((error) => {
        console.error("Failed to fetch quote:", error);
        setQuote("Failed to load the quote!");
      });
  }, []);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  return (
    <div className="daily-reminder-box">
      <div className="header-container">
        <h2>Daily Quote For You!</h2>
        <span className="message">Have a great day!</span>
      </div>
      <div className="content">
        <p className="quote">"{quote.split(" - ")[0]}"</p>
        <p className="author">- {quote.split(" - ")[1]}</p>
      </div>
    </div>
  );
}
