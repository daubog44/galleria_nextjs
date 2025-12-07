'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { compare } from 'bcryptjs';
import { createSessionToken } from '@/lib/auth';

export type State = {
    error?: string;
} | undefined;

export async function login(prevState: State, formData: FormData): Promise<State> {
    const password = formData.get('password') as string;

    if (!password) {
        return { error: 'Password required' };
    }

    // Find admin user
    const adminUser = await db.query.users.findFirst({
        where: eq(users.username, 'admin'),
    });

    if (!adminUser) {
        console.error('Admin user not found in database');
        return { error: 'Server configuration error' };
    }

    const isValid = await compare(password, adminUser.password);

    if (isValid) {
        // Set a secure session cookie
        const sessionToken = await createSessionToken();
        const cookieStore = await cookies();
        cookieStore.set('admin_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });
        redirect('/admin');
    } else {
        return { error: 'Invalid password' };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/admin/login');
}
