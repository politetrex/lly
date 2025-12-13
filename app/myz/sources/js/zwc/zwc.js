import { zwn } from '../../../data/zwn.js';
import { zwc } from '../../../data/zwc.js';
import { zwnTag } from '../zwn-tags.js';
import { zwcTag } from '../zwc_tags.js';

console.log('Script started loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const mainDiv = document.getElementById('main');

    console.log('mainDiv:', mainDiv);
    console.log('URL id parameter:', id);
    console.log('Available zwc data:', Object.keys(zwc));

    if (!mainDiv) {
        console.error('CRITICAL: mainDiv is null!');
        console.log('Available elements:', document.body.innerHTML);
        return;
    }

    if (id) {
        console.log("Loading zwc with id:", id);
        // Load specific category
        const zwcData = zwc[id];
        if (zwcData) {
            document.title = zwcData.title + " -- 作文集";
            
            // Category title
            const titleElem = document.createElement('h1');
            titleElem.textContent = zwcData.title;
            mainDiv.appendChild(titleElem);
            
            // Articles in this category
            if (zwcData.contained.length > 0) {
                const articlesTitle = document.createElement('h2');
                articlesTitle.textContent = '包含的作文';
                mainDiv.appendChild(articlesTitle);
                
                const articlesContainer = document.createElement('div');
                articlesContainer.className = 'articles-list';
                mainDiv.appendChild(articlesContainer);
                
                zwcData.contained.forEach(articleId => {
                    articlesContainer.appendChild(zwnTag(articleId));
                });
            } else {
                const emptyMsg = document.createElement('p');
                emptyMsg.textContent = '此作文集暂无作文。';
                mainDiv.appendChild(emptyMsg);
            }
            
        } else {
            mainDiv.textContent = "未找到该作文集。";
            console.error("ZWC data not found for id:", id);
        }
    } else {
        // Show all categories
        console.log("Loading all zwcs...");
        
        const titleElem = document.createElement('h1');
        titleElem.textContent = "所有作文集";
        mainDiv.appendChild(titleElem);
        
        const description = document.createElement('p');
        description.textContent = `共 ${Object.keys(zwc).length} 个作文集`;
        description.style.color = '#666';
        mainDiv.appendChild(description);
        
        // Get all categories sorted by creation date (newest first)
        const allCategories = Object.entries(zwc)
            .sort((a, b) => b[1].created - a[1].created);
        
        if (allCategories.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = '暂无作文集。';
            mainDiv.appendChild(emptyMsg);
        } else {
            const categoriesContainer = document.createElement('div');
            categoriesContainer.className = 'categories-list';
            mainDiv.appendChild(categoriesContainer);
            
            allCategories.forEach(([categoryId, categoryData]) => {
                categoriesContainer.appendChild(zwcTag(categoryId));
            });
        }
    }
});
