import ReviewForm from '../ReviewForm';

export default function NewReviewPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Aggiungi Nuova Recensione</h1>
            <ReviewForm />
        </div>
    );
}
