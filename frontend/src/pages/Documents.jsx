import { useEffect, useState } from 'react';
import { FileText, Sparkles, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import client from '../api/client';
import AppLayout from '../components/AppLayout';

const DOCUMENT_TYPES = [
  { value: 'privacy_policy', label: 'Privacy Policy' },
  { value: 'data_processing_agreement', label: 'Data Processing Agreement' },
  { value: 'breach_response_plan', label: 'Data Breach Response Plan' },
  { value: 'employee_data_handling_policy', label: 'Employee Data Handling Policy' },
  { value: 'consent_form_template', label: 'Consent Form Template' },
];

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('privacy_policy');
  const [activeDocument, setActiveDocument] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await client.get('/documents');
      setDocuments(res.data.data.documents);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const res = await client.post('/documents/generate', { documentType: selectedType });
      setDocuments((prev) => [res.data.data.document, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not generate this document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const openDocument = async (doc) => {
    try {
      const res = await client.get(`/documents/${doc._id}`);
      setActiveDocument(res.data.data.document);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not open this document.');
    }
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--color-brass)' }}>
          Generated from your data audit
        </p>
        <h1 className="font-display text-3xl" style={{ color: 'var(--color-ink)' }}>Documents</h1>
      </div>

      {error && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm"
          style={{ backgroundColor: 'color-mix(in srgb, var(--color-rust) 10%, transparent)', color: 'var(--color-rust)' }}
        >
          {error}
        </div>
      )}

      <div className="rounded-2xl border p-6 mb-8 flex items-end gap-4 flex-wrap" style={{ backgroundColor: 'white', borderColor: 'var(--color-line)' }}>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm mb-1.5" style={{ color: 'var(--color-ink)' }}>Document type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border text-sm bg-white"
            style={{ borderColor: 'var(--color-line)' }}
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-60 shrink-0"
          style={{ backgroundColor: 'var(--color-ink)' }}
        >
          <Sparkles size={16} />
          {isGenerating ? 'Generating…' : 'Generate document'}
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm" style={{ color: 'var(--color-slate)' }}>Loading…</p>
      ) : documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center" style={{ borderColor: 'var(--color-line)' }}>
          <p className="text-sm" style={{ color: 'var(--color-slate)' }}>
            No documents generated yet. Add data flows in your audit, then generate your first policy above.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'white', borderColor: 'var(--color-line)' }}>
          {documents.map((doc) => (
            <button
              key={doc._id}
              onClick={() => openDocument(doc)}
              className="ledger-row w-full flex items-center gap-4 p-5 text-left hover:bg-black/[0.02] transition-colors"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--color-paper-dim)' }}
              >
                <FileText size={18} color="var(--color-brass)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>{doc.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-slate)' }}>
                  Version {doc.version} · {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full capitalize shrink-0"
                style={{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-slate)' }}
              >
                {doc.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {activeDocument && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50" onClick={() => setActiveDocument(null)}>
          <div
            className="w-full max-w-2xl max-h-[85vh] rounded-2xl flex flex-col"
            style={{ backgroundColor: 'white' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-line)' }}>
              <h2 className="font-display text-xl" style={{ color: 'var(--color-ink)' }}>{activeDocument.title}</h2>
              <button onClick={() => setActiveDocument(null)} style={{ color: 'var(--color-slate)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto prose prose-sm max-w-none" style={{ color: 'var(--color-ink)' }}>
              <ReactMarkdown>{activeDocument.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
