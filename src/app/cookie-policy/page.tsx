import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cookie Policy | Galleria d\'Arte',
    description: 'Informativa sull\'utilizzo dei cookie e tecnologie simili.',
};

export default function CookiePolicyPage() {
    return (
        <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-stone-50 dark:bg-stone-950 transition-colors duration-300">
            <div className="max-w-3xl mx-auto space-y-8 text-stone-800 dark:text-stone-200">
                <h1 className="text-3xl md:text-4xl font-light font-serif mb-8">Cookie Policy</h1>

                <section className="space-y-4">
                    <h2 className="text-xl font-medium">Cosa sono i cookie?</h2>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                        I cookie sono piccoli file di testo che i siti visitati dagli utenti inviano ai loro terminali, dove vengono memorizzati per essere ritrasmessi agli stessi siti in occasione di visite successive. I cookie sono utilizzati per diverse finalità, hanno caratteristiche diverse e possono essere utilizzati sia dal titolare del sito che si sta visitando, sia da terze parti.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-medium">Tipologie di cookie utilizzati da questo sito</h2>

                    <div className="bg-white dark:bg-stone-900 p-6 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800">
                        <h3 className="text-lg font-medium mb-2">Cookie Tecnici</h3>
                        <p className="text-stone-600 dark:text-stone-400 text-sm mb-4">
                            Questi cookie sono essenziali per il corretto funzionamento del sito e per fornire i servizi richiesti dagli utenti. Non richiedono il consenso preventivo dell'utente.
                        </p>
                        <ul className="list-disc list-inside text-stone-600 dark:text-stone-400 text-sm space-y-1">
                            <li>Navigazione e sessione</li>
                            <li>Preferenze (es. tema scuro/chiaro)</li>
                            <li>Consenso cookie</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-stone-900 p-6 rounded-lg shadow-sm border border-stone-100 dark:border-stone-800">
                        <h3 className="text-lg font-medium mb-2">Cookie Analitici (Umami)</h3>
                        <p className="text-stone-600 dark:text-stone-400 text-sm mb-4">
                            Utilizziamo Umami Analytics per raccogliere statistiche anonime sull'utilizzo del sito. Umami è una soluzione privacy-focused che:
                        </p>
                        <ul className="list-disc list-inside text-stone-600 dark:text-stone-400 text-sm space-y-1">
                            <li>Non utilizza cookie per tracciare gli utenti tra diversi siti.</li>
                            <li>Anonimizza gli indirizzi IP.</li>
                            <li>Non raccoglie dati personali identificabili.</li>
                            <li>I dati sono ospitati sui nostri server e non vengono condivisi con terze parti.</li>
                        </ul>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-medium">Gestione dei cookie</h2>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                        Puoi gestire le tue preferenze sui cookie anche attraverso le impostazioni del tuo browser. La maggior parte dei browser consente di rifiutare o accettare i cookie, oppure di essere avvisati quando un cookie viene inviato.
                    </p>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                        Per maggiori informazioni su come gestire i cookie nel tuo browser, puoi consultare le guide ufficiali:
                    </p>
                    <ul className="flex flex-wrap gap-4 text-sm text-stone-500">
                        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="hover:underline">Google Chrome</a></li>
                        <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="hover:underline">Mozilla Firefox</a></li>
                        <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="hover:underline">Apple Safari</a></li>
                        <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="hover:underline">Microsoft Edge</a></li>
                    </ul>
                </section>

                <section className="pt-8 border-t border-stone-200 dark:border-stone-800">
                    <p className="text-xs text-stone-500">
                        Ultimo aggiornamento: Novembre 2025
                    </p>
                </section>
            </div>
        </main>
    );
}
