import {copyright, publish, owner} from "../../../../../copyright-settings/copyright-preset.js";
document.addEventListener('DOMContentLoaded', function() {
    if (copyright!="HIDDEN"){
        const footers = document.getElementsByTagName('footer');
        const currentYear = new Date().getFullYear();
        const githubUrl = "https://github.com/politetrex/***"; // Your repo
        const githubIcon = "../../../../../copyright-settings/github.png"; // Path to GitHub icon
        
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
        copyrightText += `<img src="${githubIcon}" alt="GitHub" style="height: 15px; vertical-align: middle; margin: 0 5px;">`;
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