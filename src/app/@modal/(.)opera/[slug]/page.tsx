import Modal from '@/components/Modal';
import PaintingDetail from '@/components/PaintingDetail';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <Modal>
            <PaintingDetail id={slug} isModal={true} />
        </Modal>
    );
}
