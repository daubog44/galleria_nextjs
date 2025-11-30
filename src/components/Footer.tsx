import { db } from '@/db';
import { settings, externalLinks } from '@/db/schema';
import FooterClient from './FooterClient';

export default async function Footer() {
    const currentSettings = await db.select().from(settings).limit(1);
    const setting = currentSettings[0] || {};
    const links = await db.select().from(externalLinks).orderBy(externalLinks.order);

    return <FooterClient settings={setting} links={links} />;
}
