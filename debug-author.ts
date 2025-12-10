
import { loadBlog } from './src/converters/index';
import * as fs from 'fs';

async function test() {
    try {
        const slug = 'lpic1';
        console.log(`Loading blog: ${slug}`);
        const { course } = await loadBlog(slug);
        console.log('Course data keys:', Object.keys(course || {}));
        console.log('Author:', (course as any)?.author);

        const content = course?.content || '';
        const plainText = content.replace(/<[^>]+>/g, ' ');
        const words = plainText.trim().split(/\s+/).filter(Boolean).length;
        console.log('Word count:', words);
    } catch (e) {
        console.error(e);
    }
}

test();
