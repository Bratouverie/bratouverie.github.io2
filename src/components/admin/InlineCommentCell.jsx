import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageSquare, Check, Loader2 } from 'lucide-react';

export default function InlineCommentCell({ candidate, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(candidate.comment || '');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const savingRef = useRef(false);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = async () => {
    if (savingRef.current) return;
    const trimmed = value.trim();
    if (trimmed === (candidate.comment || '').trim()) {
      setEditing(false);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      await base44.entities.Candidate.update(candidate.id, { comment: trimmed });
      if (onUpdate) onUpdate(candidate.id, { comment: trimmed });
    } catch (e) {
      setValue(candidate.comment || '');
    }
    savingRef.current = false;
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 w-40" onMouseDown={e => e.preventDefault()}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
            if (e.key === 'Escape') { setEditing(false); setValue(candidate.comment || ''); }
          }}
          onBlur={handleSave}
          className="w-full bg-[rgba(255,255,255,0.06)] border border-[#7B3FBF]/50 rounded px-2 py-1 text-xs text-[#F8FAFC] focus:outline-none"
          placeholder="Комментарий..."
        />
        {saving ? <Loader2 size={11} className="animate-spin text-[#7B3FBF] flex-shrink-0" /> : <Check size={11} className="text-green-400 flex-shrink-0 cursor-pointer" onClick={handleSave} />}
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs max-w-[140px] group">
      <MessageSquare size={13} className={candidate.comment ? 'text-[#7B3FBF] flex-shrink-0' : 'text-[#F8FAFC]/20 flex-shrink-0 group-hover:text-[#7B3FBF]/50'} />
      <span className={candidate.comment ? 'text-[#F8FAFC]/55 truncate' : 'text-[#F8FAFC]/20 group-hover:text-[#F8FAFC]/40'}>
        {candidate.comment || 'Добавить...'}
      </span>
    </button>
  );
}