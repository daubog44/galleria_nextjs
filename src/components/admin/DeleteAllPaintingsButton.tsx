'use client';

import { Trash2 } from 'lucide-react';
import { deleteAllPaintings } from '@/app/admin/paintings/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ConfirmationModal } from './ConfirmationModal';

export default function DeleteAllPaintingsButton() {
    const [isPending, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleDeleteClick = () => {
        setIsModalOpen(true);
    };

    const handleConfirm = () => {
        setIsModalOpen(false);
        startTransition(async () => {
            try {
                await deleteAllPaintings();
                toast.success("Tutti i quadri sono stati cancellati.");
                router.refresh();
            } catch (error) {
                console.error(error);
                toast.error("Errore durante la cancellazione.");
            }
        });
    };

    return (
        <>
            <button
                onClick={handleDeleteClick}
                disabled={isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
                <Trash2 className="w-4 h-4 mr-2" />
                {isPending ? 'Cancellazione...' : 'Cancella Tutto'}
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                title="CANCELLA TUTTO"
                message={`ATTENZIONE: Stai per cancellare TUTTI i quadri e le immagini associate.\n\nQuesta azione è IRREVERSIBILE.\n\nSei sicuro di voler procedere?`}
                hideDontAskAgain={true}
            />
        </>
    );
}
