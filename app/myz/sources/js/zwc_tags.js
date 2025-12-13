import { zwc } from '../../data/zwc.js';
import { zwn } from '../../data/zwn.js';

export function zwcTag(id) {
    const entry = zwc[id];
    if (!entry) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Tag not found';
        return errorDiv;
    }

    const zwc_title = entry.title;
    const zwc_created = entry.created; // Fixed variable name
    const _zwc_contained = entry.contained;

    const container = document.createElement('div');
    
    // Create main category link
    const mainLink = document.createElement('a');
    mainLink.href = `./zwc.html?id=${id}`;
    mainLink.textContent = zwc_title;
    
    // Create date text
    const dateText = document.createTextNode(` · 创建于${zwc_created}`);
    
    container.appendChild(mainLink);
    container.appendChild(dateText);

    // Handle contained articles
    if (_zwc_contained && _zwc_contained.length > 0) {
        const br = document.createElement('br');
        container.appendChild(br);
        
        const containedText = document.createTextNode('包含作品: ');
        container.appendChild(containedText);

        _zwc_contained.forEach((articleId, index) => {
            const article = zwn[articleId];
            const articleLink = document.createElement('a');
            articleLink.href = `./zwn.html?id=${articleId}`;
            articleLink.textContent = article ? article.name : "Unknown Work";
            
            container.appendChild(articleLink);
            
            // Add comma between links (except last one)
            if (index < _zwc_contained.length - 1) {
                const comma = document.createTextNode(', ');
                container.appendChild(comma);
            }
        });
    }

    return container; // Now returns a DOM Node
}