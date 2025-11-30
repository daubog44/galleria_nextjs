import Modal from '@/components/Modal';
import PaintingDetail from '@/components/PaintingDetail';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <Modal>
            <PaintingDetail id={parseInt(id)} isModal={true} />
        </Modal>
    );
}
