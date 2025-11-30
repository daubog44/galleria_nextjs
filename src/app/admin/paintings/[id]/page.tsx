import { Suspense } from 'react';
import PaintingEditor from './painting-editor';







export default async function EditPaintingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full">
            <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800 w-full max-w-full">
                <div className="px-4 py-6 sm:p-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Edit Painting</h1>
                    <Suspense fallback={<div className="text-center py-10">Loading editor...</div>}>
                        <PaintingEditor id={id} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
