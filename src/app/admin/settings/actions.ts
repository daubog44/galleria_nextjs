'use server';

import { db } from '@/db';
// import { updateMetadataFile } from '@/lib/metadata-utils'; removed
import { users, settings } from '@/db/schema';
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



export type UpdateContactInfoState = {
    error?: string;
    success?: string;
} | undefined;

export async function updateContactInfo(prevState: UpdateContactInfoState, formData: FormData): Promise<UpdateContactInfoState> {
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const navbarTitle = formData.get('navbarTitle') as string;

    try {
        // Check if settings exist
        const existingSettings = await db.select().from(settings).limit(1);

        if (existingSettings.length === 0) {
            // Create new settings (with default id)
            await db.insert(settings).values({
                email,
                phone,
                navbarTitle,
            });
        } else {
            // Update existing settings
            await db.update(settings)
                .set({
                    email,
                    phone,
                    navbarTitle,
                })
                .where(eq(settings.id, existingSettings[0].id));
        }

        revalidatePath('/admin/settings');
        revalidatePath('/contatti');
        revalidatePath('/', 'layout'); // Revalidate footer and navbar
        return { success: 'Impostazioni aggiornate con successo' };
    } catch (error) {
        console.error('Failed to update settings:', error);
        return { error: 'Errore durante l\'aggiornamento delle impostazioni' };
    }
}

// getDatabaseBackup and seedDatabase removed as they are replaced by importContent/exportContent in content-actions.ts

import { join } from 'path';
import sharp from 'sharp';

export async function uploadSiteIcon(formData: FormData) {
    try {
        const file = formData.get('icon') as File;
        if (!file) {
            return { error: 'Nessun file selezionato' };
        }

        // Validate file type (basic check)
        if (!file.type.startsWith('image/')) {
            return { error: 'Il file deve essere un\'immagine' };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const publicDir = join(process.cwd(), 'public');

        // Define paths
        const icon192Path = join(publicDir, 'icon-192x192.png');
        const icon512Path = join(publicDir, 'icon-512x512.png');

        try {
            // Use Sharp to resize and save directly
            await sharp(buffer)
                .resize(192, 192)
                .toFile(icon192Path);

            await sharp(buffer)
                .resize(512, 512)
                .toFile(icon512Path);

        } catch (convertError) {
            console.error('Sharp conversion error:', convertError);
            return { error: 'Errore durante l\'elaborazione dell\'immagine.' };
        }

        revalidatePath('/', 'layout');
        return { success: 'Icona aggiornata con successo' };

    } catch (error) {
        console.error('Upload error:', error);
        return { error: 'Si è verificato un errore durante il caricamento' };
    }
}