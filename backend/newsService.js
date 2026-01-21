// This file is responsible for fetching news from the API
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get API key from environment variables
const API_KEY = process.env.NEWS_API_KEY;

// Function to fetch tech news
export async function fetchTechNews() {
  try {
    // Build the API URL
    // We're asking for: English articles about technology from today
    const url = `https://newsapi.org/v2/top-headlines?category=technology&language=en&apiKey=${API_KEY}`;
    
    console.log('📡 Fetching news from API...');
    
    // Make the request to the API
    const response = await fetch(url);
    
    // Convert response to JSON (JavaScript Object Notation - a data format)
    const data = await response.json();
    
    // Check if the API request was successful
    if (data.status === 'ok') {
      console.log(`✅ Fetched ${data.articles.length} articles`);
      return data.articles;
    } else {
      console.error('❌ API Error:', data.message);
      return [];
    }
    
  } catch (error) {
    console.error('❌ Error fetching news:', error.message);
    return [];
  }
}

// EXPLANATION:
// - async/await: Modern way to handle things that take time
// - fetch(): Makes a request to a URL (like opening a webpage)
// - try/catch: If something goes wrong, catch the error and handle it gracefully