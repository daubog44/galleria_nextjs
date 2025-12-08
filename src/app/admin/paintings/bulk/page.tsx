'use client';

import { useState } from 'react';
import { uploadImageAction, createPaintingBulk } from '../actions';
import { toast } from 'sonner';
import { Loader2, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function BulkUploadPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
    const [logs, setLogs] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
            setLogs([]);
            setProgress({ current: 0, total: e.target.files.length, success: 0, failed: 0 });
        }
    };

    const handleBulkUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setLogs(prev => [...prev, 'Inizio caricamento bulk...']);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setProgress(prev => ({ ...prev, current: i + 1 }));

            try {
                // 1. Upload Image
                const formData = new FormData();
                formData.append('file', file);
                const uploadRes = await uploadImageAction(formData);

                if (!uploadRes.success || !uploadRes.url) {
                    throw new Error(uploadRes.error || 'Upload immagine fallito');
                }

                // 2. Create Painting (Auto-SEO will handle missing title/seo)
                const createData = new FormData();
                createData.append('imageUrl', uploadRes.url);
                // No title/desc provided - action handles defaults

                const createRes = await createPaintingBulk(createData);

                if (!createRes.success) {
                    throw new Error('Creazione record fallita');
                }

                successCount++;
                setLogs(prev => [`[OK] ${file.name} -> ${createRes.slug} (ID: ${createRes.id})`, ...prev]);

            } catch (error) {
                console.error(error);
                failCount++;
                setLogs(prev => [`[ERR] ${file.name}: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`, ...prev]);
            }
        }

        setProgress(prev => ({ ...prev, success: successCount, failed: failCount }));
        setUploading(false);
        setLogs(prev => ['Caricamento completato!', ...prev]);
        toast.success(`Completato: ${successCount} salvati, ${failCount} errori.`);
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Caricamento Multiplo Quadri</h1>
                <Link
                    href="/admin/paintings"
                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                    &larr; Torna alla lista
                </Link>
            </div>

            <div className="bg-white dark:bg-neutral-900 shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-neutral-800 p-6 md:p-8">

                {/* File Drop / Input */}
                <div className="mb-8">
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-neutral-800 dark:bg-neutral-900 hover:bg-gray-100 dark:border-neutral-700 dark:hover:border-neutral-500 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Clicca per caricare</span> o trascina qui</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Supporta caricamento multiplo (es. 90+ file)</p>
                        </div>
                        <input
                            id="dropzone-file"
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>
                </div>

                {/* Status & Actions */}
                {files.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {files.length} file selezionati
                            </div>
                            <button
                                onClick={handleBulkUpload}
                                disabled={uploading}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                        Caricamento {progress.current}/{progress.total}
                                    </>
                                ) : 'Avvia Caricamento Master'}
                            </button>
                        </div>

                        {/* Progress Bar */}
                        {uploading && (
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                ></div>
                            </div>
                        )}

                        {/* Logs */}
                        <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs md:text-sm text-green-400 border border-gray-700 shadow-inner">
                            {logs.length === 0 ? (
                                <span className="text-gray-500 italic">I log appariranno qui...</span>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="mb-1 border-b border-gray-800 pb-1 last:border-0">
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>

                        {!uploading && progress.current > 0 && (
                            <div className="flex gap-4 text-sm font-medium">
                                <div className="text-green-600 flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-1" /> Successi: {progress.success}
                                </div>
                                <div className="text-red-500 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" /> Falliti: {progress.failed}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
