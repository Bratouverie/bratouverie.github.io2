import { X } from 'lucide-react';
import CandidateFormView from '@/components/admin/CandidateFormView';

export default function CandidateFormModal({ candidate, onClose }) {
  if (!candidate) return null;

  const formUrl = candidate.form_token
    ? `${window.location.origin}/form/${candidate.form_token}`
    : null;

  const copyLink = () => {
    if (!formUrl) return;
    navigator.clipboard.writeText(formUrl).then(() => alert('Ссылка скопирована'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0D1B3E] border border-[rgba(123,63,191,0.25)] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[rgba(123,63,191,0.15)] sticky top-0 bg-[#0D1B3E] z-10">
          <div>
            <h2 className="text-lg font-black text-[#F8FAFC]">Анкета кандидата</h2>
            <p className="text-xs text-[#F8FAFC]/40 mt-0.5">{candidate.full_name}</p>
          </div>
          <div className="flex items-center gap-2">
            {formUrl && (
              <>
                <button onClick={copyLink}
                  className="px-3 py-2 text-xs rounded-lg border border-[rgba(201,168,76,0.3)] text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all">
                  Копировать ссылку
                </button>
                <a href={formUrl} target="_blank" rel="noreferrer"
                  className="px-3 py-2 text-xs rounded-lg border border-[rgba(123,63,191,0.3)] text-[#7B3FBF] hover:bg-[#7B3FBF]/10 transition-all">
                  Открыть
                </a>
              </>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-all text-[#F8FAFC]/60">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="p-6">
          <CandidateFormView candidateId={candidate.id} />
        </div>
      </div>
    </div>
  );
}