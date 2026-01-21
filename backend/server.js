// This is the heart of our backend - it handles all requests
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { saveArticle, getAllArticles, markAsRead } from './database.js';
import { fetchTechNews } from './newsService.js';

// Setup for ES modules (modern JavaScript)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an Express application
const app = express();
const PORT = 3000; // Our server will run on port 3000

// MIDDLEWARE (these run before our routes)
// Think of middleware as "pre-processing" steps

// This allows our server to understand JSON data in requests
app.use(express.json());

// This serves static files (HTML, CSS, JS) from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// ==================== ROUTES ====================
// Routes are like different pages or actions our server can handle

// Route 1: Fetch and save new articles
app.post('/api/fetch-news', async (req, res) => {
  try {
    console.log('🔄 Starting news fetch...');
    
    // Step 1: Get articles from News API
    const articles = await fetchTechNews();
    
    if (articles.length === 0) {
      return res.json({ success: true, saved: 0, message: 'No articles found' });
    }
    
    // Step 2: Save each article to database
    let savedCount = 0;
    for (const article of articles) {
      // Only save if article has required fields
      if (article.title && article.url) {
        const changes = await saveArticle(article);
        savedCount += changes; // changes is 1 if new, 0 if duplicate
      }
    }
    
    console.log(`💾 Saved ${savedCount} new articles (${articles.length - savedCount} were duplicates)`);
    
    res.json({ 
      success: true, 
      saved: savedCount,
      duplicates: articles.length - savedCount 
    });
    
  } catch (error) {
    console.error('❌ Error in fetch-news:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route 2: Get all articles from database
app.get('/api/articles', async (req, res) => {
  try {
    const articles = await getAllArticles();
    res.json({ success: true, articles });
  } catch (error) {
    console.error('❌ Error getting articles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route 3: Mark article as read
app.patch('/api/articles/:id/read', async (req, res) => {
  try {
    const articleId = req.params.id; // Get ID from URL
    await markAsRead(articleId);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error marking as read:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📱 Open your browser and visit: http://localhost:${PORT}`);
});

// EXPLANATION OF HTTP METHODS:
// - GET: Used to retrieve data (like getting articles)
// - POST: Used to create/add something (like fetching new news)
// - PATCH: Used to update existing data (like marking as read)
// - DELETE: Used to remove data (we don't use this here)