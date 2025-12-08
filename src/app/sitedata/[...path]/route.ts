
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathSegments } = await params;

    // Construct the file path relative to public/sitedata
    // Note: We mount to /app/public/sitedata
    // process.cwd() is /app
    const filePath = path.join(process.cwd(), 'public', 'sitedata', ...pathSegments);

    // Basic security check: ensure we don't escape public/sitedata
    const allowedRoot = path.join(process.cwd(), 'public', 'sitedata');
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(allowedRoot)) {
        return new NextResponse('Forbidden', { status: 403 });
    }

    if (!existsSync(filePath)) {
        return new NextResponse('Not Found', { status: 404 });
    }

    try {
        const fileBuffer = await fs.readFile(filePath);

        // Determine content type
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        if (ext === '.png') contentType = 'image/png';
        if (ext === '.gif') contentType = 'image/gif';
        if (ext === '.webp') contentType = 'image/webp';
        if (ext === '.svg') contentType = 'image/svg+xml';
        if (ext === '.txt') contentType = 'text/plain';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
