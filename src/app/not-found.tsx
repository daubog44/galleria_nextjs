import { Metadata } from 'next';
import NotFoundContent from '@/components/NotFoundContent';

export const metadata: Metadata = {
    title: '404 - Pagina non trovata | Galleria Ermetica',
    description: 'La pagina che stai cercando non esiste.',
};

export default function NotFound() {
    return <NotFoundContent />;
}
