import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/auth';

export default async function proxy(request: NextRequest) {
    // Check if the request is for the admin area
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Allow access to the login page
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next();
        }

        // Check for the admin session cookie
        const adminSession = request.cookies.get('admin_session');
        const isValid = await verifySessionToken(adminSession?.value);

        // If no session, redirect to login
        if (!isValid) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
