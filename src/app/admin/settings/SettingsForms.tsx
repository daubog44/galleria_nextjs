'use client';

import { useActionState, useEffect } from 'react';
import { updatePassword, updateContactInfo, type UpdatePasswordState, type UpdateContactInfoState } from './actions';
import { toast } from 'sonner';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ContactForm({ initialData }: { initialData: any }) {
    const [state, formAction, isPending] = useActionState<UpdateContactInfoState, FormData>(updateContactInfo, undefined);

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
        if (state?.success) {
            toast.success(state.success);
        }
    }, [state]);

    return (
        <form action={formAction} className="space-y-6">
            <div>
                <label htmlFor="navbarTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titolo Sito (Navbar)</label>
                <input type="text" name="navbarTitle" id="navbarTitle" defaultValue={initialData.navbarTitle || 'Galleria Ermetica'} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white sm:text-sm p-2 border" placeholder="Es. Galleria Ermetica" />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Appare in alto a sinistra su tutte le pagine.</p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-4">Contatti</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input type="email" name="email" id="email" defaultValue={initialData.email} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white sm:text-sm p-2 border" />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefono</label>
                        <input type="text" name="phone" id="phone" defaultValue={initialData.phone} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white sm:text-sm p-2 border" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={isPending} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer">
                    {isPending ? 'Salvataggio...' : 'Salva Impostazioni'}
                </button>
            </div>
        </form>
    );
}

export function PasswordForm() {
    const [state, formAction, isPending] = useActionState<UpdatePasswordState, FormData>(updatePassword, undefined);

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
        if (state?.success) {
            toast.success(state.success);
        }
    }, [state]);

    return (
        <form action={formAction} className="space-y-6">
            <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password Attuale</label>
                <input type="password" name="currentPassword" id="currentPassword" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white sm:text-sm p-2 border" />
            </div>
            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nuova Password</label>
                <input type="password" name="newPassword" id="newPassword" required minLength={8} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white sm:text-sm p-2 border" />
            </div>
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Conferma Nuova Password</label>
                <input type="password" name="confirmPassword" id="confirmPassword" required minLength={8} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-neutral-700 dark:border-neutral-600 dark:text-white sm:text-sm p-2 border" />
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={isPending} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer">
                    {isPending ? 'Salvataggio...' : 'Aggiorna Password'}
                </button>
            </div>
        </form>
    );
}
