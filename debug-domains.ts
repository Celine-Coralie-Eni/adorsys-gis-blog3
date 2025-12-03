import { getAllBlogMeta } from './src/server/blog/api';

async function checkDomains() {
    const metas = await getAllBlogMeta();
    console.log('Total blogs:', metas.length);
    console.log('\nBlogs with domains:');
    metas.forEach(m => {
        if (m.domain) {
            console.log(`- ${m.slug}: "${m.domain}"`);
        }
    });

    console.log('\nBlogs without domains:');
    metas.forEach(m => {
        if (!m.domain) {
            console.log(`- ${m.slug}`);
        }
    });

    const domains = new Set();
    metas.forEach(m => {
        if (m.domain) domains.add(m.domain);
    });
    console.log('\nUnique domains:');
    Array.from(domains).sort().forEach(d => console.log(`- "${d}"`));
}

checkDomains();
