import RecordInterface from '../../components/RecordInterface';

export default function RecordPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-secondary-900">Record Meeting</h1>
        <p className="text-secondary-600 mt-1">Record and transcribe your conversations with pharmaceutical representatives</p>
      </div>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <RecordInterface />
      </div>
    </div>
  );
}
