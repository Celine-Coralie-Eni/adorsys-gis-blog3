const fs = require('fs');
const path = require('path');

const redundantTags = ['development', 'devops', 'design', 'security'];
const docsDir = '/home/coralie-celine/Projects/next.js-projects/adorsys-gis-blog3/docs/blog';

function updateTags(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            updateTags(filePath);
        } else if (file === 'course.md' || file === 'slides.md') {
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;

            // Regex to find tags: [...] or tags: ...
            const tagsRegex = /tags:\s*(\[.*?\]|.*)/;
            const match = content.match(tagsRegex);

            if (match) {
                let originalTagsStr = match[1].trim();
                let tags = [];

                if (originalTagsStr.startsWith('[')) {
                    // Parse array format [tag1, tag2]
                    tags = originalTagsStr.slice(1, -1).split(',').map(t => t.trim()).filter(Boolean);
                } else {
                    // Parse comma separated format tag1, tag2
                    tags = originalTagsStr.split(',').map(t => t.trim()).filter(Boolean);
                }

                const filteredTags = tags.filter(tag => !redundantTags.includes(tag.toLowerCase()));

                if (filteredTags.length !== tags.length) {
                    const newTagsStr = `[${filteredTags.join(', ')}]`;
                    content = content.replace(tagsRegex, `tags: ${newTagsStr}`);
                    updated = true;
                    console.log(`Updated ${filePath}: Removed redundant tags. New tags: ${newTagsStr}`);
                }
            }

            if (updated) {
                fs.writeFileSync(filePath, content);
            }
        }
    });
}

updateTags(docsDir);
