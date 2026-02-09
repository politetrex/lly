// Advanced markdown parser with robust table support
const markdownParser = (text) => {
    if (!text) return '';
    
    let lines = text.split('\n');
    let result = [];
    let inTable = false;
    let tableData = [];
    let inCodeBlock = false;
    let codeBlockFence = '';
    let inList = false;
    let listType = '';
    let listItems = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Handle code blocks with different fence types (``` or ~~~)
        if (trimmedLine.match(/^(`{3,}|~{3,})/)) {
            const fenceMatch = trimmedLine.match(/^(`{3,}|~{3,})/);
            const currentFence = fenceMatch[1];
            
            if (!inCodeBlock) {
                // Start code block
                codeBlockFence = currentFence;
                const language = trimmedLine.substring(currentFence.length).trim();
                result.push(`<pre><code class="language-${language || 'text'}">`);
                inCodeBlock = true;
            } else if (currentFence === codeBlockFence) {
                // End code block
                result.push('</code></pre>');
                inCodeBlock = false;
                codeBlockFence = '';
            } else {
                // Different fence inside code block, treat as content
                result.push(line + '\n');
            }
            continue;
        }
        
        if (inCodeBlock) {
            result.push(escapeHtml(line) + '\n');
            continue;
        }
        
        // Skip empty lines when in table (but check for end of table)
        if (inTable) {
            if (trimmedLine === '') {
                // Check if table should end on empty line
                result.push(processTable(tableData));
                inTable = false;
                tableData = [];
                continue;
            }
            
            // Check if line is still part of table
            if (isTableRow(line)) {
                tableData.push(line);
                
                // Check if this is the end of the table
                if (i === lines.length - 1 || 
                    (!isTableRow(lines[i + 1]) && lines[i + 1].trim() !== '')) {
                    result.push(processTable(tableData));
                    inTable = false;
                    tableData = [];
                }
                continue;
            } else {
                // End of table
                result.push(processTable(tableData));
                inTable = false;
                tableData = [];
                // Continue processing current line normally
            }
        }
        
        // Detect table start (improved detection)
        if (!inTable && isTableRow(line)) {
            // Check if next line is a separator line
            if (i + 1 < lines.length) {
                const nextLine = lines[i + 1];
                if (isTableSeparator(nextLine)) {
                    inTable = true;
                    tableData = [line, nextLine];
                    i++; // Skip separator line
                    continue;
                }
            }
        }
        
        // Headers (including alternative syntax)
        if (trimmedLine.match(/^#{1,6}\s+/)) {
            const match = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
            if (match) {
                const level = match[1].length;
                const content = match[2].trim();
                result.push(`<h${level}>${processInline(content)}</h${level}>`);
                continue;
            }
        }
        
        // Setext-style headers (underlined)
        if (i > 0 && lines[i-1].trim() !== '' && 
            (trimmedLine.match(/^=+$/) || trimmedLine.match(/^-+$/))) {
            const prevLine = lines[i-1].trim();
            if (trimmedLine.startsWith('=')) {
                result[result.length - 1] = `<h1>${processInline(prevLine)}</h1>`;
            } else if (trimmedLine.startsWith('-')) {
                result[result.length - 1] = `<h2>${processInline(prevLine)}</h2>`;
            }
            continue;
        }
        
        // Lists
        if (trimmedLine.match(/^(\s*)([-*+]|\d+\.)\s+/)) {
            const indent = line.match(/^(\s*)/)[0].length;
            const match = line.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
            
            if (match) {
                const bullet = match[2];
                const content = match[3];
                const currentType = /^\d+\./.test(bullet) ? 'ol' : 'ul';
                
                if (!inList) {
                    listType = currentType;
                    listItems = [{ indent, content, type: currentType }];
                    inList = true;
                } else {
                    listItems.push({ indent, content, type: currentType });
                }
                
                // Check if next line is still part of list
                if (i === lines.length - 1 || 
                    !lines[i + 1].match(/^(\s*)([-*+]|\d+\.)\s/)) {
                    result.push(processList(listItems));
                    inList = false;
                    listItems = [];
                }
                continue;
            }
        }
        
        // If we were in a list but current line doesn't continue it
        if (inList) {
            result.push(processList(listItems));
            inList = false;
            listItems = [];
        }
        
        // Blockquotes (including nested)
        if (trimmedLine.startsWith('>')) {
            const levelMatch = trimmedLine.match(/^(>+)/);
            const level = levelMatch ? levelMatch[1].length : 1;
            const content = trimmedLine.substring(level).trim();
            result.push(`<blockquote class="blockquote-level-${level}">${processInline(content)}</blockquote>`);
            continue;
        }
        
        // Horizontal rule
        if (trimmedLine.match(/^([-*_])\s*\1\s*\1(\s*\1)*$/)) {
            result.push('<hr>');
            continue;
        }
        
        // Paragraphs (handle multi-line paragraphs)
        if (trimmedLine !== '') {
            // Check if previous result was a paragraph to combine
            const lastResult = result[result.length - 1];
            if (lastResult && lastResult.startsWith('<p>') && !lastResult.endsWith('</p>')) {
                result[result.length - 1] = lastResult + ' ' + processInline(line);
            } else {
                result.push(`<p>${processInline(line)}`);
            }
        } else if (result.length > 0) {
            // Close open paragraph on empty line
            const lastResult = result[result.length - 1];
            if (lastResult && lastResult.startsWith('<p>') && !lastResult.endsWith('</p>')) {
                result[result.length - 1] = lastResult + '</p>';
            }
        }
    }
    
    // Close any open tags
    if (inList) {
        result.push(processList(listItems));
    }
    
    if (inTable && tableData.length > 0) {
        result.push(processTable(tableData));
    }
    
    // Close any open paragraph
    const lastResult = result[result.length - 1];
    if (lastResult && lastResult.startsWith('<p>') && !lastResult.endsWith('</p>')) {
        result[result.length - 1] = lastResult + '</p>';
    }
    
    return result.join('\n');
};

// Helper function to escape HTML in code blocks
const escapeHtml = (text) => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// Improved table detection
const isTableRow = (line) => {
    const trimmed = line.trim();
    // Must contain at least one pipe that's not in a code span
    if (!trimmed.includes('|')) return false;
    
    // Quick check for table separator (will be handled separately)
    if (isTableSeparator(trimmed)) return false;
    
    // Check if it looks like a table row (has multiple cells or starts/ends with pipe)
    const pipeCount = (trimmed.match(/\|/g) || []).length;
    return pipeCount >= 1 && !trimmed.includes('```');
};

const isTableSeparator = (line) => {
    const trimmed = line.trim();
    // Remove spaces around pipes and check pattern
    const normalized = trimmed.replace(/\s*\|\s*/g, '|');
    return normalized.match(/^(\|:?[-]+:?)+\|?$/);
};

// Process inline elements
const processInline = (text) => {
    // Escape HTML first
    let processed = escapeHtml(text);
    
    // Bold and italic - handle nested cases
    // Triple first
    processed = processed.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>');
    // Double
    processed = processed.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
    // Single
    processed = processed.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
    
    // Strikethrough
    processed = processed.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // Inline code - handle escaped backticks
    processed = processed.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Links with title support
    processed = processed.replace(
        /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
        (match, text, url, title) => {
            const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
            return `<a href="${escapeHtml(url)}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
        }
    );
    
    // Images with alt and title
    processed = processed.replace(
        /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
        (match, alt, src, title) => {
            const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
            return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${titleAttr} class="markdown-image">`;
        }
    );
    
    // Line breaks (two spaces at end of line)
    processed = processed.replace(/  \n/g, '<br>\n');
    
    return processed;
};

// Process tables
// 专门的表格解析器
const parseTableFromMarkdown = (markdown) => {
    const lines = markdown.split('\n');
    const tables = [];
    let currentTable = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) continue;
        
        // 检查是否可能是表格行
        if (line.includes('|')) {
            // 检查是否是分隔行
            const isSeparator = /^[\s|:|-]+$/.test(line.replace(/[^|:-]/g, ''));
            
            if (!currentTable) {
                // 开始新表格
                currentTable = {
                    rows: [line],
                    hasSeparator: isSeparator
                };
            } else {
                // 添加到现有表格
                currentTable.rows.push(line);
                if (isSeparator) currentTable.hasSeparator = true;
            }
        } else if (currentTable) {
            // 非表格行，结束当前表格
            if (currentTable.rows.length >= 2 && currentTable.hasSeparator) {
                tables.push(buildTableHTML(currentTable.rows));
            }
            currentTable = null;
        }
    }
    
    // 处理最后一个表格
    if (currentTable && currentTable.rows.length >= 2 && currentTable.hasSeparator) {
        tables.push(buildTableHTML(currentTable.rows));
    }
    
    return tables;
};

const buildTableHTML = (tableRows) => {
    // 找到分隔行的索引
    let separatorIndex = -1;
    for (let i = 0; i < tableRows.length; i++) {
        if (isSeparatorRow(tableRows[i])) {
            separatorIndex = i;
            break;
        }
    }
    
    if (separatorIndex === -1) return '';
    
    // 解析对齐方式
    const separatorCells = tableRows[separatorIndex].trim().split('|').filter(c => c);
    const alignments = separatorCells.map(cell => {
        const trimmed = cell.trim();
        if (/:[-]+:/i.test(trimmed)) return 'center';
        if (trimmed.startsWith(':')) return 'left';
        if (trimmed.endsWith(':')) return 'right';
        return 'left';
    });
    
    // 构建 HTML
    let html = '<table class="markdown-table"><thead>';
    
    // 表头
    const headerCells = tableRows[0].trim().split('|').filter(c => c);
    html += '<tr>';
    headerCells.forEach((cell, i) => {
        const align = alignments[i] || 'left';
        html += `<th align="${align}">${processInline(cell.trim())}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // 数据行
    for (let i = separatorIndex + 1; i < tableRows.length; i++) {
        const cells = tableRows[i].trim().split('|').filter(c => c);
        if (cells.length === 0) continue;
        
        html += '<tr>';
        cells.forEach((cell, j) => {
            const align = alignments[j] || 'left';
            html += `<td align="${align}">${processInline(cell.trim())}</td>`;
        });
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    return html;
};

const isSeparatorRow = (line) => {
    const cleaned = line.trim().replace(/[^|:-]/g, '');
    return /^[\|: -]+$/.test(cleaned) && cleaned.includes('-');
};

// Parse a table row into cells
const parseTableRow = (row) => {
    // Remove leading/trailing pipes and split
    const trimmed = row.trim();
    const withoutOuterPipes = trimmed.replace(/^\||\|$/g, '');
    return withoutOuterPipes.split('|').map(cell => cell.trim());
};

// Get cell alignment from separator row
const getCellAlignment = (separatorRow, cellIndex) => {
    const cells = parseTableRow(separatorRow);
    if (cellIndex >= cells.length) return null;
    
    const cell = cells[cellIndex];
    const leftAlign = cell.startsWith(':');
    const rightAlign = cell.endsWith(':');
    
    if (leftAlign && rightAlign) return 'center';
    if (leftAlign) return 'left';
    if (rightAlign) return 'right';
    return null;
};

// Process nested lists (simplified)
const processList = (items) => {
    if (items.length === 0) return '';
    
    let html = '';
    let currentIndent = -1;
    let openLists = [];
    
    items.forEach((item, index) => {
        // Close lists if moving to less indentation
        while (openLists.length > 0 && item.indent < openLists[openLists.length - 1].indent) {
            html += '</li></' + openLists.pop().type + '>';
        }
        
        // Start new list if needed
        if (openLists.length === 0 || item.indent > openLists[openLists.length - 1].indent) {
            const tag = item.type === 'ol' ? 'ol' : 'ul';
            html += `<${tag}>`;
            openLists.push({ indent: item.indent, type: tag });
        } else if (index > 0) {
            // Close previous li if at same level
            html += '</li>';
        }
        
        // Add list item
        html += `<li>${processInline(item.content)}`;
    });
    
    // Close all open lists
    while (openLists.length > 0) {
        html += '</li></' + openLists.pop().type + '>';
    }
    
    return html;
};

// Process content array
export const processContent = (contentArray) => {
    if (content === undefined || content === null) {
        return [];
    }
    return contentArray.map(item => {
        if (typeof item === 'string') {
            const html = markdownParser(item);
            return {
                type: 'markdown',
                raw: item,
                html: html,
                hasTables: item.includes('|') && isTableSeparator(item.split('\n')[1] || ''),
                hasLists: item.match(/^[-*+]\s/m) || item.match(/^\d+\.\s/m),
                hasCode: item.includes('```') || item.includes('`'),
                isEmpty: item.trim() === ''
            };
        } else if (typeof item === 'object' && item !== null) {
            if (item.content && typeof item.content === 'string') {
                return {
                    ...item,
                    html: markdownParser(item.content),
                    processed: true
                };
            }
            return item;
        }
        return item;
    });
};

// Export for use in other modules
export { markdownParser, processInline };