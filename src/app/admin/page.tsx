
export default function AdminDashboard() {
    return (
        <div className="h-full flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
            <div className="flex-1 bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden p-4">
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Statistiche del sito. Se non caricano,
                    <a href={`${process.env.NEXT_PUBLIC_UMAMI_REACHABLE_URL}/share/${process.env.NEXT_PUBLIC_UMAMI_SHARE_ID}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline ml-1">
                        apri Umami in una nuova scheda
                    </a>.
                </p>
                <iframe
                    src={`${process.env.NEXT_PUBLIC_UMAMI_REACHABLE_URL}/share/${process.env.NEXT_PUBLIC_UMAMI_SHARE_ID}`}
                    className="w-full h-[calc(100vh-200px)] border-0"
                    title="Umami Analytics"
                />
            </div>
        </div>
    );
}
