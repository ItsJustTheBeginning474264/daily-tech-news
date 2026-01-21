// This file handles all database operations
import sqlite3 from 'sqlite3';

// Create a connection to our database
// If 'news.db' doesn't exist, SQLite will create it automatically
const db = new sqlite3.Database('./backend/news.db', (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Create the articles table if it doesn't exist yet
// This runs when our app first starts
db.run(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT UNIQUE NOT NULL,
    source TEXT,
    publishedAt TEXT,
    isRead INTEGER DEFAULT 0
  )
`, (err) => {
  if (err) {
    console.error('❌ Error creating table:', err);
  } else {
    console.log('✅ Articles table ready');
  }
});

// EXPLANATION OF TABLE STRUCTURE:
// - id: Auto-incrementing number (like 1, 2, 3...) to identify each article
// - title: The headline of the article
// - description: Short summary
// - url: Link to the full article (UNIQUE means no duplicates!)
// - source: Which website published it
// - publishedAt: When it was published
// - isRead: 0 = not read, 1 = read (we use numbers because SQLite doesn't have true/false)

// Function to save a new article to the database
export function saveArticle(article) {
  return new Promise((resolve, reject) => {
    // INSERT OR IGNORE means: add it if new, skip if URL already exists
    const sql = `
      INSERT OR IGNORE INTO articles (title, description, url, source, publishedAt)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    // The question marks (?) are placeholders - SQLite will safely insert our values
    // This prevents "SQL injection" attacks (a security thing you'll learn about later)
    db.run(sql, [
      article.title,
      article.description,
      article.url,
      article.source.name,
      article.publishedAt
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        // this.changes tells us if a new row was added (1) or if it was duplicate (0)
        resolve(this.changes);
      }
    });
  });
}

// Function to get all articles from database
export function getAllArticles() {
  return new Promise((resolve, reject) => {
    // ORDER BY publishedAt DESC means: newest articles first
    db.all('SELECT * FROM articles ORDER BY publishedAt DESC', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Function to mark an article as read
export function markAsRead(articleId) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE articles SET isRead = 1 WHERE id = ?', [articleId], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export default db