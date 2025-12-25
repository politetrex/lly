import {copyright, publish, owner} from "../../../../../copyright-settings/copyright-preset.js";
document.addEventListener('DOMContentLoaded', function() {
    if (copyright!="HIDDEN"){
        const footers = document.getElementsByTagName('footer');
        const currentYear = new Date().getFullYear();
        const githubUrl = "https://github.com/politetrex/***"; // Your repo
        const githubIcon = "<svg height=\"16\" width=\"16\" viewBox=\"0 0 16 16\" style=\"vertical-align: middle;\">\
            <path fill=\"#333\" d=\"M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z\">\
            </path></svg>"; // GitHub icon
        
        // Build copyright text
        let copyrightText = '&copy; ';
        
        if (currentYear === publish) {
            copyrightText += `Copyright ${publish} ${owner}`;
        } else {
            copyrightText += `Copyright ${publish}-${currentYear} ${owner}`;
        }

        copyrightText += '. All rights reserved. ';

        // Add GitHub link with icon
        copyrightText += `<a href="${githubUrl}" target="_blank" rel="noopener noreferrer">`;
        copyrightText += githubIcon;
        copyrightText += `GitHub</a>`;

        // Apply to all footers
        for (let i = 0; i < footers.length; i++) {
            // Replace content or append
            footers[i].innerHTML = copyrightText;

            // Optional: Add styling to footer
            footers[i].style.cssText = `
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 0.9em;
                border-top: 1px solid #eee;
                margin-top: 40px;
            `;

            // Style the GitHub link
            const githubLink = footers[i].querySelector('a[href*="github"]');
            if (githubLink) {
                githubLink.style.cssText = `
                    color: #333;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 5px 10px;
                    border-radius: 4px;
                    transition: background-color 0.2s;
                `;

                githubLink.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#f5f5f5';
                });

                githubLink.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'transparent';
                });
            }
        }

        console.log(`Copyright applied to ${footers.length} footer(s)`);
    } else {
        console.log("Copyright hidden.")
    }
});