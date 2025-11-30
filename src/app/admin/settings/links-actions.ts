'use server';

import { db } from '@/db';
import { externalLinks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const LinkSchema = z.object({
    label: z.string().min(1, "L'etichetta è obbligatoria"),
    url: z.string().min(1, "Il valore è obbligatorio"), // Relaxed validation to allow non-URL strings (e.g. phone numbers)
    icon: z.string().min(1, "L'icona è obbligatoria"),
});

export type LinkState = {
    error?: string;
    success?: string;
};

export async function addLink(prevState: LinkState | undefined, formData: FormData): Promise<LinkState> {
    const rawData = {
        label: formData.get('label'),
        url: formData.get('url'),
        icon: formData.get('icon'),
    };

    const validatedFields = LinkSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors.label?.[0] ||
                validatedFields.error.flatten().fieldErrors.url?.[0] ||
                validatedFields.error.flatten().fieldErrors.icon?.[0] ||
                "Dati non validi",
        };
    }

    try {
        await db.insert(externalLinks).values({
            label: validatedFields.data.label,
            url: validatedFields.data.url,
            icon: validatedFields.data.icon,
        });

        revalidatePath('/admin/settings');
        revalidatePath('/', 'layout');
        return { success: 'Link aggiunto con successo!' };
    } catch (error) {
        console.error('Failed to add link:', error);
        return { error: 'Errore durante l\'aggiunta del link.' };
    }
}

export async function deleteLink(id: number): Promise<LinkState> {
    try {
        await db.delete(externalLinks).where(eq(externalLinks.id, id));
        revalidatePath('/admin/settings');
        revalidatePath('/', 'layout');
        return { success: 'Link eliminato con successo!' };
    } catch (error) {
        console.error('Failed to delete link:', error);
        return { error: 'Errore durante l\'eliminazione del link.' };
    }
}

export async function updateLink(id: number, prevState: LinkState | undefined, formData: FormData): Promise<LinkState> {
    const rawData = {
        label: formData.get('label'),
        url: formData.get('url'),
        icon: formData.get('icon'),
    };

    const validatedFields = LinkSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors.label?.[0] ||
                validatedFields.error.flatten().fieldErrors.url?.[0] ||
                validatedFields.error.flatten().fieldErrors.icon?.[0] ||
                "Dati non validi",
        };
    }

    try {
        await db.update(externalLinks)
            .set({
                label: validatedFields.data.label,
                url: validatedFields.data.url,
                icon: validatedFields.data.icon,
            })
            .where(eq(externalLinks.id, id));

        revalidatePath('/admin/settings');
        revalidatePath('/', 'layout');
        return { success: 'Link aggiornato con successo!' };
    } catch (error) {
        console.error('Failed to update link:', error);
        return { error: 'Errore durante l\'aggiornamento del link.' };
    }
}
