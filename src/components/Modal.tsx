'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function Modal({ children }: { children: React.ReactNode }) {
    const overlay = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);



    useEffect(() => {
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    function onDismiss() {
        setIsOpen(false);
        router.back();
    }

    if (!isOpen) return null;

    return (
        <div
            ref={overlay}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm overflow-y-auto"
            onClick={onDismiss}
        >
            <div
                className="min-h-screen px-4 text-center flex items-center justify-center"
            >
                <div
                    className="relative inline-block bg-transparent text-left align-middle transition-all transform pointer-events-none my-8"
                >
                    <div
                        className="relative pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
