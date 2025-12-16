import { zwn } from '../../../../../data/myz/zwn.js';
import { zwc } from '../../../../../data/myz/zwc.js';
import { zwnTag } from '../zwn-tags.js';

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const mainDiv = document.getElementById('main');

if (id) {
    console.log("Loading work with id:", id);
    // load specific work
    const workData = zwn[id];
    if (workData) {
        // Get the latest version (last one in the array)
        const latestVersion = workData.versions[workData.versions.length - 1];
        
        document.title = workData.name + " -- 我的作文区";
        const titleElem = document.createElement('h1');
        titleElem.textContent = workData.name;
        mainDiv.appendChild(titleElem);
        
        // Version selector (only show if multiple versions exist)
        if (workData.versions.length > 1) {
            const versionContainer = document.createElement('div');
            versionContainer.style.margin = '10px 0';
            versionContainer.style.padding = '10px';
            versionContainer.style.backgroundColor = '#f5f5f5';
            versionContainer.style.borderRadius = '5px';
            
            const versionLabel = document.createElement('label');
            versionLabel.textContent = '选择版本: ';
            versionLabel.style.marginRight = '10px';
            versionLabel.style.fontWeight = 'bold';
            
            const versionSelect = document.createElement('select');
            versionSelect.id = 'version-select';
            
            // Add versions in chronological order (oldest to newest)
            workData.versions.forEach((version, index) => {
                const option = document.createElement('option');
                const dateStr = version.date.toString();
                const formattedDate = `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
                option.value = index;
                option.textContent = `版本 ${index + 1} (${formattedDate})`;
                
                // Select the latest version by default
                if (index === workData.versions.length - 1) {
                    option.selected = true;
                }
                
                versionSelect.appendChild(option);
            });
            
            versionContainer.appendChild(versionLabel);
            versionContainer.appendChild(versionSelect);
            mainDiv.appendChild(versionContainer);
        }
        
        const dateElem = document.createElement('p');
        const dateStr = latestVersion.date.toString();
        dateElem.textContent = `发布于: ${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
        
        // Show version count if multiple versions
        if (workData.versions.length > 1) {
            dateElem.textContent += ` (共 ${workData.versions.length} 个版本)`;
        }
        
        mainDiv.appendChild(dateElem);

        const _zwn_contained = workData.class;
        if (_zwn_contained && _zwn_contained.length > 0) {
            const containedText = document.createTextNode('包含于: ');
            mainDiv.appendChild(containedText);
    
            _zwn_contained.forEach((cid, index) => {
                const centry = zwc[cid];
                const classLink = document.createElement('a');
                classLink.href = `./zwc.html?id=${cid}`;
                classLink.textContent = centry ? centry.title : "Unknown Class";
                
                mainDiv.appendChild(classLink);
                
                // Add comma between links (except last one)
                if (index < _zwn_contained.length - 1) {
                    const comma = document.createTextNode(', ');
                    mainDiv.appendChild(comma);
                }
            });
        }
        
        // Load and display the actual content
        const contentContainer = document.createElement('div');
        contentContainer.className = 'work-content';
        contentContainer.id = 'content-container';
        mainDiv.appendChild(contentContainer);
        
        // Function to display a specific version
        function displayVersion(versionIndex) {
            const version = workData.versions[versionIndex];
            contentContainer.innerHTML = '';
            
            // Allow specific safe tags only
            function safeHTML(html) {
                return html.replace(/<(\/?)(a|strong|em|br|p)(\s[^>]*)?>/gi, '<$1$2$3>');
            }

            // Then use:
            version.content.forEach(paragraph => {
                if (paragraph && paragraph.trim() !== '') {
                    const pElem = document.createElement('p');
                    pElem.innerHTML = safeHTML(paragraph);
                    contentContainer.appendChild(pElem);
                }
            });
            
            // Update the date display
            const dateStr = version.date.toString();
            dateElem.textContent = `发布于: ${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
            if (workData.versions.length > 1) {
                dateElem.textContent += ` (共 ${workData.versions.length} 个版本)`;
            }
        }
        
        // Display the latest version initially
        displayVersion(workData.versions.length - 1);
        
        // Add event listener for version changes
        if (workData.versions.length > 1) {
            const versionSelect = document.getElementById('version-select');
            versionSelect.addEventListener('change', function() {
                displayVersion(parseInt(this.value));
            });
        }
        
    } else {
        mainDiv.textContent = "未找到该作文。";
        console.error("Work data not found for id:", id);
    }
} else {
    // Show all works
    console.log("Loading all works...");
    
    const titleElem = document.createElement('h1');
    titleElem.textContent = "所有作文";
    mainDiv.appendChild(titleElem);
    
    // Create mainDiv for all work links
    const worksContainer = document.createElement('div');
    worksContainer.className = 'works-list';
    mainDiv.appendChild(worksContainer);
    
    // Get all works and sort by latest version date (newest first)
    const allWorks = Object.entries(zwn)
        .sort((a, b) => {
            const aLatest = a[1].versions[a[1].versions.length - 1].date;
            const bLatest = b[1].versions[b[1].versions.length - 1].date;
            return bLatest - aLatest;
        });
    
    if (allWorks.length === 0) {
        worksContainer.textContent = "暂无作文。";
    } else {
        allWorks.forEach(([workId, workData]) => {
            // Use your zwnTag function to create each work link
            const workElement = zwnTag(workId);
            worksContainer.appendChild(workElement);
        });
    }
}