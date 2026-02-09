import {DATA} from  "../../../../data/notes/data.js"
import {processContent} from "./md/md_process.js"

// load
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const note = document.getElementById('content');

if (id in DATA){
    const nt_c = DATA[id];
    const dt = nt_c["date"];
    
    // 处理内容，获取处理后的数组
    const processedContent = processContent(nt_c["content"]);
    
    // 提取 HTML 内容并拼接
    let htmlContent = '';
    processedContent.forEach(item => {
        if (item.html) {
            htmlContent += item.html;
        } else if (typeof item === 'string') {
            htmlContent += item;
        }
    });
    
    // 创建容器并设置 HTML
    const WNc = document.createElement('div');
    WNc.innerHTML = htmlContent;
    note.appendChild(WNc);
} else {
    note.innerHTML = "笔记未找到";
}