'use client';

import { useState, useActionState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addLink, deleteLink, updateLink, type LinkState } from './links-actions';
import { Instagram, Facebook, MessageCircle, Twitter, Linkedin, Youtube, Globe, Mail, Phone, Trash2, Edit2, Plus, Loader2 } from 'lucide-react';
import { ConfirmationModal } from '@/components/admin/ConfirmationModal';
import { toast } from 'sonner';


type Link = {
    id: number;
    label: string;
    url: string;
    icon: string;
    order: number;
};

const ICONS = {
    instagram: Instagram,
    facebook: Facebook,
    whatsapp: MessageCircle,
    twitter: Twitter,
    linkedin: Linkedin,
    youtube: Youtube,
    globe: Globe,
    mail: Mail,
    phone: Phone,
};

export default function LinksManager({ initialLinks }: { initialLinks: Link[] }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Link Esterni</h3>
                <button
                    onClick={() => setIsAdding(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Link
                </button>
            </div>

            {isAdding && (
                <div className="bg-gray-50 dark:bg-neutral-700/50 p-4 rounded-lg border border-gray-200 dark:border-neutral-700">
                    <LinkForm
                        onCancel={() => setIsAdding(false)}
                        onSuccess={() => setIsAdding(false)}
                    />
                </div>
            )}

            <div className="space-y-4">
                {initialLinks.map((link) => (
                    <div key={link.id} className="bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-4 flex items-center justify-between shadow-sm">
                        {editingId === link.id ? (
                            <div className="w-full">
                                <LinkForm
                                    initialData={link}
                                    onCancel={() => setEditingId(null)}
                                    onSuccess={() => setEditingId(null)}
                                    isEditing
                                />
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-gray-100 dark:bg-neutral-700 rounded-full">
                                        {ICONS[link.icon as keyof typeof ICONS] ? (
                                            (() => {
                                                const Icon = ICONS[link.icon as keyof typeof ICONS];
                                                return <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />;
                                            })()
                                        ) : (
                                            <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{link.label}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-xs">{link.url}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setEditingId(link.id)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                        title="Modifica"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <DeleteButton id={link.id} />
                                </div>
                            </>
                        )}
                    </div>
                ))}
                {initialLinks.length === 0 && !isAdding && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        Nessun link esterno configurato.
                    </p>
                )}
            </div>
        </div>
    );
}

function LinkForm({ initialData, onCancel, onSuccess, isEditing = false }: { initialData?: Link, onCancel: () => void, onSuccess: () => void, isEditing?: boolean }) {
    const action = isEditing && initialData ? updateLink.bind(null, initialData.id) : addLink;
    const [state, formAction, isPending] = useActionState<LinkState, FormData>(action, {});

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
        if (state?.success) {
            toast.success(isEditing ? 'Link aggiornato!' : 'Link aggiunto!');
            onSuccess();
        }
    }, [state, isEditing, onSuccess]);

    return (
        <form action={formAction} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Etichetta</label>
                    <input
                        type="text"
                        name="label"
                        id="label"
                        defaultValue={initialData?.label}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-600 dark:border-neutral-500 dark:text-white sm:text-sm p-2 border"
                        placeholder="Es. Instagram"
                    />
                </div>
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valore (URL, Email, Telefono)</label>
                    <input
                        type="text"
                        name="url"
                        id="url"
                        defaultValue={initialData?.url}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-600 dark:border-neutral-500 dark:text-white sm:text-sm p-2 border"
                        placeholder="https://... o mailto:... o tel:..."
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icona</label>
                <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                    {Object.entries(ICONS).map(([key, Icon]) => (
                        <label key={key} className="cursor-pointer">
                            <input
                                type="radio"
                                name="icon"
                                value={key}
                                defaultChecked={initialData?.icon === key || (!initialData && key === 'globe')}
                                className="peer sr-only"
                            />
                            <div className="p-2 rounded-md border border-gray-200 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-600 peer-checked:bg-indigo-50 peer-checked:border-indigo-500 dark:peer-checked:bg-indigo-900/30 dark:peer-checked:border-indigo-500 flex justify-center items-center transition-all">
                                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300 peer-checked:text-indigo-600 dark:peer-checked:text-indigo-400" />
                            </div>
                        </label>
                    ))}
                </div>
            </div>


            <div className="flex justify-end space-x-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-neutral-700 dark:text-gray-200 dark:border-neutral-600 dark:hover:bg-neutral-600 cursor-pointer"
                >
                    Annulla
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex justify-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                >
                    {isPending ? 'Salvataggio...' : (isEditing ? 'Aggiorna' : 'Salva')}
                </button>
            </div>
        </form>
    );
}

function DeleteButton({ id }: { id: number }) {
    const [isPending, setIsPending] = useState(false);
    const [isRefreshing, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const STORAGE_KEY = 'admin_delete_confirmation_disabled';

    const handleDeleteClick = () => {
        const dontAskAgain = localStorage.getItem(STORAGE_KEY) === 'true';
        if (dontAskAgain) {
            performDelete();
        } else {
            setIsModalOpen(true);
        }
    };

    const performDelete = async () => {
        setIsPending(true);
        const promise = deleteLink(id);

        toast.promise(promise, {
            loading: 'Eliminazione...',
            success: () => {
                startTransition(() => {
                    router.refresh();
                });
                setIsPending(false);
                return 'Link eliminato';
            },
            error: (err) => {
                console.error("Failed to delete link:", err);
                setIsPending(false);
                return 'Errore durante eliminazione';
            }
        });
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
                className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
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
                title="Elimina Link"
                message="Sei sicuro di voler eliminare questo link? Questa azione non può essere annullata."
            />
        </>
    );
}
