
import { db } from './index';
import { biography, reviews } from './schema';
import { biography as bioContent, reviews as reviewsContent } from '../data/content';

async function main() {
    console.log('Restoring content to database...');

    // Restore Biography
    console.log('Restoring biography...');
    await db.delete(biography); // Clear existing
    await db.insert(biography).values({
        content: bioContent,
    });
    console.log('Biography restored.');

    // Restore Reviews
    console.log('Restoring reviews...');
    await db.delete(reviews); // Clear existing

    for (const review of reviewsContent) {
        await db.insert(reviews).values({
            title: review.title,
            author: review.author,
            content: review.content,
            source: review.source,
            date: review.date,
            type: review.type,
        });
    }
    console.log('Reviews restored.');

    console.log('Content restoration complete.');
    process.exit(0);
}

main().catch((err) => {
    console.error('Error restoring content:', err);
    process.exit(1);
});
