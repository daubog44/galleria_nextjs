import { db } from '@/db';
import { paintings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import EditForm from './edit-form';

export default async function PaintingEditor({ id }: { id: string }) {
    await connection();

    let painting = null;
    let error = null;

    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
        console.warn(`Invalid painting ID: ${id}`);
        return <div>Invalid ID</div>;
    }

    try {
        const result = await db.select().from(paintings).where(eq(paintings.id, parsedId)).limit(1);
        if (result.length > 0) {
            painting = result[0];
        }
    } catch (e) {
        console.warn("Database error in PaintingEditor (expected during build):", e);
        error = e;
    }

    if (error) {
        return <div>Editor unavailable during build.</div>;
    }

    if (!painting) {
        notFound();
    }

    return <EditForm painting={painting} />;
}
