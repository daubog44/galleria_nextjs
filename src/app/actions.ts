'use server';

import { db } from "@/db";
import { paintings } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

import { unstable_cache } from 'next/cache';

export const getPaintings = unstable_cache(
    async (page: number, limit: number) => {
        const offset = (page - 1) * limit;

        try {
            const data = await db.select()
                .from(paintings)
                .orderBy(desc(paintings.createdAt))
                .limit(limit)
                .offset(offset);

            const nextData = await db.select()
                .from(paintings)
                .orderBy(desc(paintings.createdAt))
                .limit(1)
                .offset(offset + limit);

            const result = { data, hasMore: nextData.length > 0 };
            return {
                data: result.data.map(painting => ({
                    ...painting,
                    sold: painting.sold ?? false
                })),
                hasMore: result.hasMore
            };
        } catch (error) {
            console.warn("Database connection failed in getPaintings (expected during build):", error);
            return { data: [], hasMore: false };
        }
    },
    ['paintings-list'],
    { tags: ['paintings'] }
);

export const getPainting = unstable_cache(
    async (id: number) => {
        try {
            const res = await db.select().from(paintings).where(eq(paintings.id, id)).limit(1);
            return res[0] ? { ...res[0], sold: res[0].sold ?? false } : null;
        } catch (error) {
            console.warn("Database connection failed in getPainting:", error);
            return null;
        }
    },
    ['painting-detail'],
    { tags: ['paintings'] }
);
