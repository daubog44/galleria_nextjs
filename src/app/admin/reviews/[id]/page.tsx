import { db } from '@/db';
import { reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ReviewForm from '../ReviewForm';

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const review = await db.select().from(reviews).where(eq(reviews.id, parseInt(id))).limit(1);

    if (review.length === 0) {
        notFound();
    }

    const r = review[0];

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Modifica Post/Recensione</h1>
            <ReviewForm initialData={r} isEditing={true} />
        </div>
    );
}
