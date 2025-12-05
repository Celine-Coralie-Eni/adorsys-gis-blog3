const fs = require('fs');
const path = require('path');

const mappings = {
    'Infrastructure as Code': 'DevOps',
    'Design': 'Design',
    'DevOps & System Administration': 'DevOps',
    'Backend Development': 'Development',
    'Programming': 'Development',
    'Frontend & Design': 'Development',
    'Authentication & Authorization': 'Security',
    'Web Development': 'Development',
    'Network': 'DevOps',
    'Localization (i18n)': 'Development',
    'Identity & Access Management': 'Security',
    'DevOps et Administration Système': 'DevOps',
    'UX': 'Design'
};

const docsDir = '/home/coralie-celine/Projects/next.js-projects/adorsys-gis-blog3/docs/blog';

/**
 * @param {string} dir
 */
function updateDomains(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            updateDomains(filePath);
        } else if (file === 'course.md') {
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;

            Object.entries(mappings).forEach(([oldDomain, newDomain]) => {
                const regex = new RegExp(`domain:\\s*${oldDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, `domain: ${newDomain}`);
                    updated = true;
                    console.log(`Updated ${filePath}: ${oldDomain} -> ${newDomain}`);
                }
            });

            if (updated) {
                fs.writeFileSync(filePath, content);
            }
        }
    });
}

updateDomains(docsDir);
