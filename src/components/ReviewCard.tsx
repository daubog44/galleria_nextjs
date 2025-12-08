'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { Quote, X, Maximize2, ExternalLink } from 'lucide-react';
import MarkdownViewer from '@/components/MarkdownViewer';

// Define the shape of the data
export interface ReviewData {
    id: number;
    title: string | null;
    author: string | null;
    content: string;
    source: string | null;
    date: string | null;
    type: string | null;
    imageUrl: string | null;
    slug: string | null;
}

interface ReviewCardProps {
    review: ReviewData;
    index: number;
}

// Extracted Modal Component
function ReviewModal({ review, onClose }: { review: ReviewData; onClose: () => void }) {
    // Disable body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                {/* Header Image (Optional) */}
                {review.imageUrl && (
                    <div className="relative w-full h-48 sm:h-64 shrink-0">
                        <Image
                            src={review.imageUrl}
                            alt={review.title || 'Review Image'}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {!review.imageUrl && (
                    <div className="flex justify-end p-4 border-b border-stone-100 dark:border-neutral-800">
                        <button
                            onClick={onClose}
                            className="p-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Modal Content */}
                <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-6">
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-stone-200 dark:border-white/10 text-stone-500 dark:text-stone-400 bg-stone-50/50 dark:bg-white/5">
                            {review.type || 'Recensione'}
                        </span>
                        {review.date && (
                            <span className="text-sm font-serif italic text-stone-400 dark:text-stone-500">
                                {review.date}
                            </span>
                        )}
                    </div>

                    {review.title && (
                        <h2 className="font-serif text-3xl md:text-4xl text-stone-900 dark:text-stone-50 mb-6 leading-tight">
                            {review.title}
                        </h2>
                    )}

                    <div className="prose prose-stone dark:prose-invert prose-lg leading-relaxed font-light text-stone-700 dark:text-stone-300">
                        <MarkdownViewer content={review.content} />
                    </div>

                    <div className="mt-10 pt-6 border-t border-stone-100 dark:border-neutral-800 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-500 font-serif font-bold text-xl border border-amber-200/50 dark:border-amber-700/30">
                            {review.author ? review.author[0].toUpperCase() : 'A'}
                        </div>
                        <div>
                            <p className="font-bold text-base text-stone-900 dark:text-stone-100">
                                {review.author || 'Anonimo'}
                            </p>
                            {review.source && (
                                <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-wider font-semibold">
                                    {review.source}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function ReviewCard({ review, index }: ReviewCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Threshold for text length to trigger truncation (approx. characters)
    const CHAR_THRESHOLD = 300;
    const isLongText = review.content.length > CHAR_THRESHOLD;

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    return (
        <>
            <div
                className="group relative break-inside-avoid rounded-2xl bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md border border-stone-200/50 dark:border-white/5 p-6 md:p-8 transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-stone-200/50 dark:hover:shadow-black/50 overflow-hidden mb-6 md:mb-8 transform"
                style={{
                    animation: `fadeInUp 0.8s ease-out forwards`,
                    animationDelay: `${index * 150}ms`,
                    opacity: 0,
                    transform: 'translateY(20px)'
                }}
            >
                {/* Decorative Quote Icon Background */}
                <Quote className="absolute -top-4 -right-4 w-32 h-32 text-stone-100 dark:text-neutral-800/50 transform rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                    {/* Header: Type tag & Date */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-2">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-stone-200 dark:border-white/10 text-stone-500 dark:text-stone-400 bg-stone-50/50 dark:bg-white/5">
                                {review.type || 'Recensione'}
                            </span>
                            {review.slug && (
                                <Link
                                    href={`/stile/${review.slug}`}
                                    className="p-1 rounded-full text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                                    title="Vai alla pagina"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            )}
                        </div>
                        {review.date && (
                            <span className="text-xs font-serif italic text-stone-400 dark:text-stone-500">
                                {review.date}
                            </span>
                        )}
                    </div>

                    {/* Title can also be a link if slug exists */}
                    {review.title && (
                        review.slug ? (
                            <Link href={`/stile/${review.slug}`} className="block mb-4 group/link">
                                <h3 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-stone-100 leading-tight group-hover/link:text-amber-700 dark:group-hover/link:text-amber-500 transition-colors duration-300">
                                    {review.title}
                                </h3>
                            </Link>
                        ) : (
                            <h3 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-stone-100 mb-4 leading-tight group-hover:text-amber-700/80 dark:group-hover:text-amber-500 transition-colors duration-300">
                                {review.title}
                            </h3>
                        )
                    )}

                    {/* Image (if any) */}
                    {review.imageUrl && (
                        <div className="relative w-full h-56 mb-6 rounded-lg overflow-hidden shadow-md shrink-0 cursor-pointer" onClick={() => setIsOpen(true)}>
                            <Image
                                src={review.imageUrl}
                                alt={review.title || 'Review Image'}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                    )}

                    {/* Content Container */}
                    <div
                        ref={contentRef}
                        className={`relative prose prose-stone dark:prose-invert prose-sm md:prose-base leading-relaxed text-stone-600 dark:text-stone-300 font-light font-sans mb-6 ${isLongText ? 'max-h-[200px] overflow-hidden' : ''}`}
                    >
                        <MarkdownViewer content={review.content} />

                        {/* Fade Overlay for long text */}
                        {isLongText && (
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-[#171717] to-transparent pointer-events-none"></div>
                        )}
                    </div>

                    {/* Read More Button */}
                    {isLongText && (
                        <div className="flex justify-center mb-6">
                            <button
                                onClick={() => setIsOpen(true)}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 hover:text-amber-800 dark:hover:text-amber-300 transition-colors py-2 px-4 rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            >
                                Leggi tutto <Maximize2 className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    {/* Footer: Author & Source */}
                    <div className="mt-auto pt-6 border-t border-stone-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-500 font-serif font-bold text-lg border border-amber-200/50 dark:border-amber-700/30">
                                {review.author ? review.author[0].toUpperCase() : 'A'}
                            </div>
                            <div>
                                <p className="font-bold text-sm text-stone-900 dark:text-stone-100 tracking-wide">
                                    {review.author || 'Anonimo'}
                                </p>
                                {review.source && (
                                    <p className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-wider font-semibold">
                                        {review.source}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {mounted && isOpen && <ReviewModal review={review} onClose={() => setIsOpen(false)} />}
        </>
    );
}
