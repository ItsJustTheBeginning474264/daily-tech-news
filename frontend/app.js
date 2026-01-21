// This file handles all frontend interactions

// Get references to HTML elements
const fetchBtn = document.getElementById('fetchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const articlesContainer = document.getElementById('articles');
const statusDiv = document.getElementById('status');

// Add event listeners (like "onClick" in HTML)
fetchBtn.addEventListener('click', fetchNews);
refreshBtn.addEventListener('click', loadArticles);

// Function to show status messages
function showStatus(message, type = 'success') {
  statusDiv.textContent = message;
  statusDiv.className = `status show ${type}`;
  
  // Hide after 5 seconds
  setTimeout(() => {
    statusDiv.classList.remove('show');
  }, 5000);
}

// Function to fetch news from API and save to database
async function fetchNews() {
  try {
    // Disable button while fetching
    fetchBtn.disabled = true;
    fetchBtn.textContent = '⏳ Fetching...';
    
    // Make request to our backend
    const response = await fetch('/api/fetch-news', {
      method: 'POST'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showStatus(`✅ Saved ${data.saved} new articles! (${data.duplicates} duplicates skipped)`, 'success');
      // Automatically load the articles
      loadArticles();
    } else {
      showStatus('❌ Error fetching news', 'error');
    }
    
  } catch (error) {
    showStatus('❌ Network error: ' + error.message, 'error');
  } finally {
    // Re-enable button
    fetchBtn.disabled = false;
    fetchBtn.textContent = '📡 Fetch Latest News';
  }
}

// Function to load articles from database
async function loadArticles() {
  try {
    refreshBtn.disabled = true;
    refreshBtn.textContent = '⏳ Loading...';
    
    const response = await fetch('/api/articles');
    const data = await response.json();
    
    if (data.success) {
      displayArticles(data.articles);
    } else {
      showStatus('❌ Error loading articles', 'error');
    }
    
  } catch (error) {
    showStatus('❌ Network error: ' + error.message, 'error');
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.textContent = '🔄 Refresh Articles';
  }
}

// Function to display articles in the UI
function displayArticles(articles) {
  // Clear current articles
  articlesContainer.innerHTML = '';
  
  if (articles.length === 0) {
    articlesContainer.innerHTML = '<p class="placeholder">No articles yet. Click "Fetch Latest News"!</p>';
    return;
  }
  
  // Create HTML for each article
  articles.forEach(article => {
    const articleDiv = document.createElement('div');
    articleDiv.className = `article ${article.isRead ? 'read' : ''}`;
    
    // Format the date nicely
    const date = new Date(article.publishedAt);
    const formattedDate = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    articleDiv.innerHTML = `
      <h3>${article.title}</h3>
      <p>${article.description || 'No description available'}</p>
      <div class="article-meta">
        <span>📰 ${article.source}</span>
        <span>📅 ${formattedDate}</span>
      </div>
      <div class="article-actions">
        <a href="${article.url}" target="_blank">Read Full Article →</a>
        <button onclick="markAsRead(${article.id})" ${article.isRead ? 'disabled' : ''}>
          ${article.isRead ? '✓ Read' : 'Mark as Read'}
        </button>
      </div>
    `;
    
    articlesContainer.appendChild(articleDiv);
  });
}

// Function to mark article as read
async function markAsRead(articleId) {
  try {
    const response = await fetch(`/api/articles/${articleId}/read`, {
      method: 'PATCH'
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Reload articles to show updated status
      loadArticles();
    }
    
  } catch (error) {
    showStatus('❌ Error marking as read', 'error');
  }
}

// Make function available globally (so onclick in HTML works)
window.markAsRead = markAsRead;

// Load articles when page first loads
loadArticles();