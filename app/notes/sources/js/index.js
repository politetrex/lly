// app/notes/sources/js/index.js
import { DATA } from '../../../../data/notes/data.js';

const notesContainer = document.getElementById('ntl');

// Convert to array and sort
const allNotes = Object.entries(DATA)
    .sort((a, b) => {
        // Sort by date (newest first)
        const aDate = a[1].date || 0;
        const bDate = b[1].date || 0;
        
        if (bDate !== aDate) {
            return bDate - aDate;
        }
        
        // Same date? Sort by ID ending number
        const aId = a[0]; // "N-cObsM0"
        const bId = b[0]; 
        
        const aEndNum = parseInt(aId.match(/(\d+)$/)?.[0] || '0');
        const bEndNum = parseInt(bId.match(/(\d+)$/)?.[0] || '0');
        
        return bEndNum - aEndNum;
    });

console.log('Found notes:', allNotes.length);

// Display notes
allNotes.forEach(([noteId, noteData]) => {
    const noteElement = createNoteElement(noteId, noteData);
    if (notesContainer) {
        notesContainer.appendChild(noteElement);
    } else {
        console.error('notesContainer not found for note:', noteId);
    }
});

function createNoteElement(id, note) {
    const div = document.createElement('div');
    div.className = 'note-card';
    div.dataset.noteId = id;
    
    // Format date
    const dateStr = note.date?.toString() || '';
    const formattedDate = dateStr ? 
        `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}` : 
        'No date';
    
    // Get preview from first line of content
    let preview = 'No content';
    if (Array.isArray(note.content) && note.content.length > 0) {
        preview = note.content[0] || 'Empty';
        // Remove markdown headers for preview
        preview = preview.replace(/^#+\s*/, '').substring(0, 100);
    }
    
    div.innerHTML = `
        <a class="note-header"href="./info.html?id=${id}">
            <strong>ID: ${id}</strong> &nbsp;
            <span class="note-date">${formattedDate}</span>
            &nbsp;${note.encoded ? '🔒 加密文档' : '📄 纯文字'}
            &nbsp;${Array.isArray(note.content) ? note.content.length + '行' : '0行'}
        </a>
        <pre class="note-preview">${preview}...</pre>
    `;
    
    return div;
}