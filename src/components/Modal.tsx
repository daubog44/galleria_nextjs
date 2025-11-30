'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function Modal({ children }: { children: React.ReactNode }) {
    const overlay = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
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
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss();
                        }}
                        className="absolute -top-12 right-0 z-[60] text-white/80 hover:text-white transition-colors p-2 bg-white/10 rounded-full backdrop-blur-sm cursor-pointer hover:bg-white/20 pointer-events-auto"
                        aria-label="Chiudi"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
