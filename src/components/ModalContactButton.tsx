'use client';

import { useRouter } from 'next/navigation';

export default function ModalContactButton() {
    const router = useRouter();

    const handleClick = () => {
        // Force a hard navigation to ensure the modal state is completely cleared
        // and we land on the contact page cleanly.
        window.location.href = '/contatti';
    };

    return (
        <button
            onClick={handleClick}
            className="absolute bottom-4 right-4 bg-stone-800/90 hover:bg-stone-700 text-white px-6 py-2 rounded-full uppercase text-xs font-bold tracking-widest shadow-lg transition-colors flex items-center gap-2 cursor-pointer"
        >
            <span>Contattami</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
        </button>
    );
}
