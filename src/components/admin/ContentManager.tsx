'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { exportContent, importContent, syncFromFiles } from '@/app/admin/settings/content-actions';
import { Loader2, Upload, Download, AlertTriangle, Database, FolderSync } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ContentManager() {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const router = useRouter();

    const handleSync = async () => {
        setIsExporting(true); // Reuse loading state or add new one
        const toastId = toast.loading('Sincronizzazione in corso...');
        try {
            const res = await syncFromFiles();
            if (res.success) {
                toast.success(res.message, { id: toastId });
                router.refresh();
            } else {
                toast.error(res.message, { id: toastId });
            }
        } catch {
            toast.error('Errore di comunicazione', { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        const toastId = toast.loading('Generazione backup in corso...');

        try {
            const result = await exportContent();
            if (result.success && result.data && result.filename) {
                // Trigger download
                const link = document.createElement('a');
                link.href = `data:application/zip;base64,${result.data}`;
                link.download = result.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success('Backup scaricato con successo', { id: toastId });
            } else {
                toast.error(result.message || 'Errore durante l\'export', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Errore di connessione', { id: toastId });
        } finally {
            setIsExporting(false);
        }
    };

    const handleImportClick = () => {
        document.getElementById('backup-upload')?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('ATTENZIONE: Stai per sovrascrivere l\'intero contenuto del sito (quadri, biografia, impostazioni) con questo backup. L\'operazione è irreversibile. Vuoi procedere?')) {
            e.target.value = ''; // Reset input
            return;
        }

        setIsImporting(true);
        const toastId = toast.loading('Ripristino backup in corso... Non chiudere la pagina.');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await importContent(formData);
            if (result.success) {
                toast.success(result.message, { id: toastId });
                // Optional: Refresh page to show new data?
                // window.location.reload(); 
            } else {
                toast.error(result.message || 'Errore durante il ripristino', { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error('Errore durante l\'upload del backup', { id: toastId });
        } finally {
            setIsImporting(false);
            e.target.value = ''; // Reset input
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Backup e Ripristino Contenuti</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Salva o ripristina tutti i contenuti del sito (Quadri, Biografia, Recensioni, Immagini).
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={handleExport}
                    disabled={isExporting || isImporting}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Scarica Backup (.zip)
                </button>

                <div className="relative">
                    <input
                        type="file"
                        id="backup-upload"
                        accept=".zip"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isExporting || isImporting}
                    />
                    <button
                        onClick={handleImportClick}
                        disabled={isExporting || isImporting}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        Ripristina da Backup
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-gray-100 dark:border-neutral-800 space-y-4">
                <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
                    <Database className="h-6 w-6" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sincronizzazione File System</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Scansiona le cartelle <code>sitedata/paintings</code> e <code>reviews</code> per aggiungere automaticamente i file trovati al database. Utile se carichi file via FTP.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={handleSync}
                        disabled={isExporting}
                        className="flex items-center justify-center px-4 py-2 border border-blue-200 dark:border-blue-900/50 shadow-sm text-sm font-medium rounded-lg text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
                    >
                        <FolderSync className="mr-2 h-4 w-4" />
                        Sincronizza File
                    </button>
                </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 rounded-md text-xs">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                    <strong>Attenzione:</strong> Il ripristino sovrascriverà TUTTI i dati attuali (eccetto i dati di accesso utente). Assicurati di avere un backup recente prima di procedere.
                </p>
            </div>
        </div>
    );
}
