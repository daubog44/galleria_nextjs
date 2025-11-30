import { describe, it, expect, vi } from 'vitest';
import { getPaintings } from './actions';

// Mock the database
vi.mock('@/db', () => ({
    db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue([
            { id: 1, title: 'Test Painting', sold: false }
        ]),
    },
}));

// Mock unstable_cache
vi.mock('next/cache', () => ({
    unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
    revalidateTag: vi.fn(),
    revalidatePath: vi.fn(),
}));

describe('getPaintings', () => {
    it('should return a list of paintings', async () => {
        const result = await getPaintings(1, 10);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].title).toBe('Test Painting');
    });
});
