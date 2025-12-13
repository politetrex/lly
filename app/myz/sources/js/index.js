import { zwn } from '../../data/zwn.js';
import { zwnTag } from './zwn-tags.js';

const recentUpdatesDiv = document.getElementById('recent-updates');

// Get ALL articles and sort by date (newest first)
const allArticles = Object.entries(zwn)
    .sort((a, b) => b[1].date - a[1].date)  // Changed to b - a for descending
    .slice(0, 5);  // Show 5 most recent articles

console.log('Found articles:', allArticles.map(([id, data]) => id));

// Display each article
allArticles.forEach(([articleId, articleData]) => {
    console.log('Adding article:', articleId, articleData.name);
    recentUpdatesDiv.appendChild(zwnTag(articleId));
});

// Optional: Show message if no articles found
if (allArticles.length === 0) {
    recentUpdatesDiv.textContent = '暂无作文';
}