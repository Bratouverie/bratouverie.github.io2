import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { agency_id, call_purpose = 'check' } = body;

    if (!agency_id) {
      return Response.json({ error: 'agency_id required' }, { status: 400 });
    }

    const agency = await base44.entities.Agency.get(agency_id);
    if (!agency) {
      return Response.json({ error: 'Agency not found' }, { status: 404 });
    }

    const candidates = await base44.entities.Candidate.filter({ agency_id });

    let script = `Здравствуйте, ${agency.name}!\n\n`;

    if (call_purpose === 'check') {
      script += `Я звоню, чтобы уточнить статус кандидатов:\n`;
      const sbPending = candidates.filter(c => c.sb_check === 'На проверке');
      const medPending = candidates.filter(c => c.medical_check === 'Не проверялся');
      
      if (sbPending.length > 0) {
        script += `• На проверке СБ: ${sbPending.length} кандидатов\n`;
      }
      if (medPending.length > 0) {
        script += `• Ожидают медкомиссию: ${medPending.length} кандидатов\n`;
      }
    } else if (call_purpose === 'training') {
      script += `Хотим пригласить вас на обучение по работе с CRM. `;
      script += `Это займет 30-40 минут. Какое время вам удобно?\n`;
    } else if (call_purpose === 'payment') {
      const readyForPayment = candidates.filter(c => c.payment_basis === 'Готовится к отправке' && c.payment_made !== 'Да');
      script += `Готовим выплаты для ваших кандидатов.\n`;
      if (readyForPayment.length > 0) {
        script += `Сумма на выплату: ${readyForPayment.length} × 100 000 ₽ = ${readyForPayment.length * 100000} ₽\n`;
      }
      script += `Проверьте реквизиты в личном кабинете и подтвердите получение выплаты.\n`;
    }

    script += `\nОсобые условия контракта:\n`;
    if (agency.special_conditions) {
      script += `${agency.special_conditions}\n`;
    } else {
      script += `(Никаких дополнительных условий)\n`;
    }

    script += `\nКогда мы можем вас ещё раз побеспокоить?`;

    return Response.json({
      status: 'success',
      agency_name: agency.name,
      call_purpose,
      script,
      candidates_count: candidates.length,
      contact: {
        phone: agency.phone,
        email: agency.email,
        manager_email: agency.manager_email
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});