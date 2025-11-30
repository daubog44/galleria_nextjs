'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmationModal } from './ConfirmationModal';
import { Trash2, Loader2 } from 'lucide-react';

interface DeleteFormProps {
    id: number;
    action: (formData: FormData) => Promise<void>;
    className?: string;
    onOptimisticDelete?: () => void;
    onDeleteError?: () => void;
}

export function DeleteForm({ id, action, className, onOptimisticDelete, onDeleteError }: DeleteFormProps) {
    const [isPending, setIsPending] = useState(false);
    const [isRefreshing, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const STORAGE_KEY = 'admin_delete_confirmation_disabled';

    const handleDeleteClick = (event: React.FormEvent) => {
        event.preventDefault();
        const dontAskAgain = localStorage.getItem(STORAGE_KEY) === 'true';

        if (dontAskAgain) {
            performDelete();
        } else {
            setIsModalOpen(true);
        }
    };

    const performDelete = async () => {
        // Optimistic update: immediately notify parent to hide the item
        if (onOptimisticDelete) {
            onOptimisticDelete();
        }

        setIsPending(true);
        const formData = new FormData();
        formData.append('id', id.toString());
        try {
            await action(formData);
            startTransition(() => {
                router.refresh();
            });
            setIsPending(false);
        } catch (error) {
            console.error("Failed to delete:", error);
            // Revert optimistic update if failed
            if (onDeleteError) {
                onDeleteError();
            } else {
                alert("Errore durante l'eliminazione");
            }
            setIsPending(false);
        }
    };

    const handleConfirm = (dontAskAgain: boolean) => {
        if (dontAskAgain) {
            localStorage.setItem(STORAGE_KEY, 'true');
        }
        setIsModalOpen(false);
        performDelete();
    };

    return (
        <>
            <button
                onClick={handleDeleteClick}
                disabled={isPending || isRefreshing}
                className={`cursor-pointer ${className}`}
                title="Elimina"
            >
                {isPending || isRefreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                title="Elimina Elemento"
                message="Sei sicuro di voler eliminare questo elemento? Questa azione non può essere annullata."
            />
        </>
    );
}
