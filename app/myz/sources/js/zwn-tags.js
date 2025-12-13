import { zwc } from '../../data/zwc.js';
import { zwn } from '../../data/zwn.js';

export function zwnTag(id) {
    const entry = zwn[id];
    if (!entry) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Tag not found';
        return errorDiv;
    }

    const zwn_name = entry.name;
    // Get date from latest version
    const latestVersion = entry.versions[entry.versions.length - 1];
    const zwn_date = latestVersion.date;
    const _zwn_contained = entry.class;

    // Create main container
    const container = document.createElement('div');
    container.style.marginBottom = '15px';
    container.style.padding = '10px';
    container.style.border = '1px solid #eee';
    container.style.borderRadius = '5px';
    
    // Create main link
    const mainLink = document.createElement('a');
    mainLink.href = `./zwn.html?id=${id}`;
    mainLink.textContent = zwn_name;
    mainLink.style.fontSize = '1.1em';
    mainLink.style.fontWeight = 'bold';
    mainLink.style.textDecoration = 'none';
    
    // Add version badge if multiple versions
    if (entry.versions.length > 1) {
        const versionBadge = document.createElement('span');
        versionBadge.textContent = ` ${entry.versions.length}版`;
        versionBadge.style.background = '#007bff';
        versionBadge.style.color = 'white';
        versionBadge.style.padding = '2px 6px';
        versionBadge.style.borderRadius = '10px';
        versionBadge.style.fontSize = '0.8em';
        versionBadge.style.marginLeft = '5px';
        mainLink.appendChild(versionBadge);
    }
    
    // Create date text
    const dateText = document.createTextNode(` · 更新于${zwn_date}`);
    
    // Add main link and date to container
    container.appendChild(mainLink);
    container.appendChild(dateText);

    // Handle contained classes
    if (_zwn_contained && _zwn_contained.length > 0) {
        const br = document.createElement('br');
        container.appendChild(br);
        
        const containedText = document.createTextNode('包含于: ');
        container.appendChild(containedText);

        _zwn_contained.forEach((cid, index) => {
            const centry = zwc[cid];
            const classLink = document.createElement('a');
            classLink.href = `./zwc.html?id=${cid}`;
            classLink.textContent = centry ? centry.title : "Unknown Class";
            classLink.style.margin = '0 3px';
            classLink.style.textDecoration = 'none';
            
            container.appendChild(classLink);
            
            // Add comma between links (except last one)
            if (index < _zwn_contained.length - 1) {
                const comma = document.createTextNode(', ');
                container.appendChild(comma);
            }
        });
    }

    return container;
}