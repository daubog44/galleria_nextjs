import { db } from '@/db';
import { settings, externalLinks, seoMetadata } from '@/db/schema';
import { ContactForm, PasswordForm } from './SettingsForms';
import LinksManager from './LinksManager';
import PageSeoManager from './PageSeoManager';
// Imports removed
// import MetadataManager from '@/components/admin/MetadataManager'; removed
import ContentManager from '@/components/admin/ContentManager';
import IconUploader from './IconUploader';

export default async function SettingsPage() {
    const currentSettings = await db.select().from(settings).limit(1);
    const setting = currentSettings[0] || {};
    const links = await db.select().from(externalLinks).orderBy(externalLinks.order);
    const seoList = await db.select().from(seoMetadata);

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Impostazioni</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Info Form */}
                <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Impostazioni Generali</h2>
                    <ContactForm initialData={setting} />
                    <div className="mt-8 border-t border-stone-200 dark:border-stone-700 pt-8">
                        <IconUploader />
                    </div>
                </div>

                {/* Password Form */}
                <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 h-fit">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Modifica Password</h2>
                    <PasswordForm />
                </div>
            </div>

            {/* External Links Manager */}
            <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
                <LinksManager initialLinks={links} />
            </div>

            {/* SEO Manager */}
            <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Gestione SEO e Titoli Pagine</h2>
                <div className="space-y-8">
                    <PageSeoManager
                        pageKey="home"
                        pageName="Home (Galleria)"
                        initialData={seoList.find(s => s.pageKey === 'home') || {}}
                    />
                    <PageSeoManager
                        pageKey="biography"
                        pageName="Biografia"
                        initialData={seoList.find(s => s.pageKey === 'biography') || {}}
                    />
                    <PageSeoManager
                        pageKey="reviews"
                        pageName="Dicono di me (Recensioni)"
                        initialData={seoList.find(s => s.pageKey === 'reviews') || {}}
                    />
                    <PageSeoManager
                        pageKey="contact"
                        pageName="Contatti"
                        initialData={seoList.find(s => s.pageKey === 'contact') || {}}
                    />
                </div>
            </div>

            {/* Database Management */}
            <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 border border-red-100 dark:border-red-900/30">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Gestione Database</h2>
                <div className="space-y-6">
                    <ContentManager />
                    {/* MetadataManager removed */}
                    {/* BackupButton and SeedButton removed */}
                </div>
            </div>
        </div>
    );
}
