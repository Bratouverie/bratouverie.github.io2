import { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, User, Phone, MapPin, Calendar, Briefcase, Heart, Shield, Banknote, FileCheck, AlertTriangle, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getMissingRequiredDocs } from '@/lib/docUtils';

/**
 * Компонент для отображения данных анкеты кандидата в режиме чтения.
 * Загружает CandidateForm по candidate_id и показывает все поля.
 */
export default function CandidateFormView({ candidateId, isCandidateView = false }) {
  const [formRecord, setFormRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) { setLoading(false); return; }
    base44.entities.CandidateForm.filter({ candidate_id: candidateId })
      .then(records => {
        // Берём заполненную анкету, либо последнюю
        const rec = records.find(r => r.status === 'completed') || records[0] || null;
        setFormRecord(rec);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [candidateId]);

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-2 border-[#7B3FBF]/30 border-t-[#7B3FBF] rounded-full animate-spin" />
    </div>
  );

  if (!formRecord) return (
    <div className="text-center py-12 text-[#F8FAFC]/30">
      <FileText size={32} className="mx-auto mb-3 opacity-30" />
      <p className="text-sm">Анкета ещё не заполнена кандидатом</p>
    </div>
  );

  const f = formRecord;

  const Field = ({ label, value }) => (
    <div>
      <div className="text-xs text-[#F8FAFC]/35 uppercase tracking-wide mb-0.5">{label}</div>
      <div className="text-sm text-[#F8FAFC]/90">{value || <span className="text-[#F8FAFC]/20">—</span>}</div>
    </div>
  );

  const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(123,63,191,0.12)] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className="text-[#7B3FBF]" />
        <h4 className="text-xs font-bold text-[#7B3FBF] uppercase tracking-widest">{title}</h4>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );

  const docs = f.uploaded_docs || [];

  return (
    <div className="space-y-3">
      {/* Статус анкеты */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(123,63,191,0.08)] border border-[rgba(123,63,191,0.2)]">
        <FileCheck size={14} className="text-[#7B3FBF]" />
        <span className="text-xs text-[#F8FAFC]/70">
          Статус: <strong className={f.status === 'completed' ? 'text-green-400' : 'text-[#C9A84C]'}>
            {f.status === 'completed' ? 'Заполнена' : 'Ожидает заполнения'}
          </strong>
          {f.submitted_at && <span className="text-[#F8FAFC]/40 ml-2">· {new Date(f.submitted_at).toLocaleString('ru-RU')}</span>}
        </span>
        {f.form_token && (
          <a href={`/form/${f.form_token}?edit=1`} target="_blank" rel="noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-[#7B3FBF] hover:text-[#8B4FCF] transition-colors">
            <ExternalLink size={11} /> Открыть анкету
          </a>
        )}
      </div>

      {/* Персональные данные */}
      <Section title="Персональные данные" icon={User}>
        <Field label="ФИО" value={f.full_name} />
        <Field label="Дата рождения" value={f.birth_date} />
        <Field label="Гражданство" value={f.citizenship} />
        <Field label="Место рождения" value={f.birth_place} />
        <Field label="Город проживания" value={f.city} />
        <Field label="Адрес регистрации" value={f.registration_address} />
        <Field label="Фактический адрес" value={f.actual_address} />
        <Field label="Пункт сбора" value={f.assembly_point} />
        <Field label="Дата прибытия" value={f.arrival_date} />
      </Section>

      {/* Паспорт */}
      {f.passport_series && (
        <Section title="Паспорт" icon={FileText}>
          <Field label="Серия / Номер" value={`${f.passport_series || ''} ${f.passport_number || ''}`.trim()} />
          <Field label="Кем выдан" value={f.passport_issued_by} />
          <Field label="Дата выдачи" value={f.passport_issued_date} />
          <Field label="Код подразделения" value={f.passport_dept_code} />
        </Section>
      )}

      {/* Контакты */}
      <Section title="Контакты" icon={Phone}>
        <Field label="Телефон" value={f.phone} />
        <Field label="Email" value={f.email} />
      </Section>

      {/* Специализация */}
      <Section title="Специализация и образование" icon={Briefcase}>
        <Field label="Должность" value={f.position} />
        <Field label="Уровень образования" value={f.education_level} />
        <Field label="Учебное заведение" value={f.education_institution} />
        <Field label="Специальность" value={f.education_specialty} />
        <Field label="Год окончания" value={f.graduation_year} />
        <Field label="Доп. сертификаты" value={f.additional_certs} />
        {f.skills?.length > 0 && (
          <div className="sm:col-span-2">
            <div className="text-xs text-[#F8FAFC]/35 uppercase tracking-wide mb-1">Навыки</div>
            <div className="flex flex-wrap gap-1.5">
              {f.skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs bg-[rgba(123,63,191,0.12)] text-[#7B3FBF] border border-[rgba(123,63,191,0.2)]">{s}</span>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Опыт работы */}
      {(f.work_experience || f.shift_experience) && (
        <Section title="Опыт работы" icon={Calendar}>
          <Field label="Общий опыт" value={f.work_experience} />
          <Field label="Вахтовый опыт" value={f.shift_experience} />
        </Section>
      )}

      {/* Здоровье */}
      {(f.chronic_diseases || f.disabilities || f.health_notes) && (
        <Section title="Здоровье" icon={Heart}>
          <Field label="Хронические заболевания" value={f.chronic_diseases} />
          <Field label="Инвалидность / ограничения" value={f.disabilities} />
          <Field label="Доп. сведения" value={f.health_notes} />
        </Section>
      )}

      {/* Семья */}
      {(f.family_status || f.emergency_contact_name) && (
        <Section title="Семья и контакты" icon={User}>
          <Field label="Семейное положение" value={f.family_status} />
          <Field label="Дети" value={f.children_count} />
          <Field label="Экстренный контакт" value={f.emergency_contact_name} />
          <Field label="Телефон контакта" value={f.emergency_contact_phone} />
          <Field label="Степень родства" value={f.emergency_contact_relation} />
        </Section>
      )}

      {/* Воинский учёт */}
      {(f.military_rank || f.military_unit) && (
        <Section title="Воинский учёт" icon={Shield}>
          <Field label="Звание" value={f.military_rank} />
          <Field label="Специальность" value={f.military_specialty} />
          <Field label="Часть / место службы" value={f.military_unit} />
        </Section>
      )}

      {/* Судимость */}
      {f.has_criminal_record && (
        <Section title="Судимость" icon={Shield}>
          <Field label="Наличие судимости" value={f.has_criminal_record} />
          <Field label="Подробности" value={f.criminal_record_details} />
        </Section>
      )}

      {/* Мотивация */}
      {(f.salary_expectations || f.motivation) && (
        <Section title="Мотивация и ожидания" icon={Banknote}>
          <Field label="Ожидаемая ЗП" value={f.salary_expectations} />
          <Field label="Мотивация" value={f.motivation} />
          <Field label="Готов начать с" value={f.ready_to_start_date} />
        </Section>
      )}

      {/* Предупреждение о неполных документах */}
      {(() => {
        const missing = getMissingRequiredDocs(docs);
        if (missing.length === 0) return null;
        return (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/8 border border-red-500/25 text-xs text-red-400">
            <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Не хватает обязательных документов:</div>
              <div className="text-red-300/70 mt-0.5">{missing.map(d => d.label).join(', ')}</div>
            </div>
          </div>
        );
      })()}

      {/* Документы из анкеты */}
      {docs.length > 0 && (
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(123,63,191,0.12)] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={14} className="text-[#7B3FBF]" />
            <h4 className="text-xs font-bold text-[#7B3FBF] uppercase tracking-widest">Документы из анкеты ({docs.length})</h4>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {docs.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(123,63,191,0.1)] rounded-lg">
                <FileText size={13} className="text-[#C9A84C] flex-shrink-0" />
                <span className="text-xs text-[#F8FAFC]/70 truncate flex-1">{doc.name}</span>
                <a href={doc.url} target="_blank" rel="noreferrer"
                  className="p-1 rounded hover:bg-[#7B3FBF]/20 text-[#F8FAFC]/50 hover:text-[#C9A84C] transition-all flex-shrink-0">
                  <Download size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Комментарии (видны только кандидатам, если это просмотр их анкеты) */}
      {isCandidateView && f.comment && (
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(123,63,191,0.12)] rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-[#7B3FBF]" />
            <h4 className="text-xs font-bold text-[#7B3FBF] uppercase tracking-widest">Комментарии команды</h4>
          </div>
          <div className="text-xs text-[#F8FAFC]/70 whitespace-pre-wrap">{f.comment}</div>
        </div>
      )}
      </div>
      );
      }