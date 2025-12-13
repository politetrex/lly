import { zwn } from '../../data/zwn.js';
const table = document.getElementById('heatmap-table');
for (let i = 0; i < 3; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < 10; j++) {
        const cell = document.createElement('td');
        
        row.appendChild(cell);
    }
    table.appendChild(row);
}