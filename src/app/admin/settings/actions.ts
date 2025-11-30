'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { compare, hash } from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export type UpdatePasswordState = {
    error?: string;
    success?: string;
} | undefined;

export async function updatePassword(prevState: UpdatePasswordState, formData: FormData): Promise<UpdatePasswordState> {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: 'Tutti i campi sono obbligatori' };
    }

    if (newPassword !== confirmPassword) {
        return { error: 'Le nuove password non coincidono' };
    }

    if (newPassword.length < 8) {
        return { error: 'La nuova password deve essere di almeno 8 caratteri' };
    }

    try {
        // Get admin user
        const adminUser = await db.query.users.findFirst({
            where: eq(users.username, 'admin'),
        });

        if (!adminUser) {
            return { error: 'Utente non trovato' };
        }

        // Verify current password
        const isValid = await compare(currentPassword, adminUser.password);
        if (!isValid) {
            return { error: 'Password attuale non corretta' };
        }

        // Hash new password
        const hashedPassword = await hash(newPassword, 10);

        // Update password
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.username, 'admin'));

        revalidatePath('/admin/settings');
        return { success: 'Password aggiornata con successo' };
    } catch (error) {
        console.error('Failed to update password:', error);
        return { error: 'Errore durante l\'aggiornamento della password' };
    }
}

import { settings } from '@/db/schema';

export type UpdateContactInfoState = {
    error?: string;
    success?: string;
} | undefined;

export async function updateContactInfo(prevState: UpdateContactInfoState, formData: FormData): Promise<UpdateContactInfoState> {
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;

    try {
        // Check if settings exist
        const existingSettings = await db.select().from(settings).limit(1);

        if (existingSettings.length === 0) {
            // Create new settings
            await db.insert(settings).values({
                email,
                phone,
            });
        } else {
            // Update existing settings
            await db.update(settings)
                .set({
                    email,
                    phone,
                })
                .where(eq(settings.id, existingSettings[0].id));
        }

        revalidatePath('/admin/settings');
        revalidatePath('/contatti');
        revalidatePath('/', 'layout'); // Revalidate footer
        return { success: 'Informazioni di contatto aggiornate con successo' };
    } catch (error) {
        console.error('Failed to update contact info:', error);
        return { error: 'Errore durante l\'aggiornamento delle informazioni di contatto' };
    }
}
