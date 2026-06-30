import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'admin') {
      return Response.json({ error: 'Only admins can respond to tickets' }, { status: 403 });
    }

    const body = await req.json();
    const { ticket_id, answer, status = 'answered' } = body;

    if (!ticket_id || !answer) {
      return Response.json({ error: 'ticket_id and answer required' }, { status: 400 });
    }

    if (!['answered', 'closed'].includes(status)) {
      return Response.json({ error: 'status must be "answered" or "closed"' }, { status: 400 });
    }

    const ticket = await base44.entities.AgentTicket.get(ticket_id);
    if (!ticket) {
      return Response.json({ error: 'Ticket not found' }, { status: 404 });
    }

    await base44.entities.AgentTicket.update(ticket_id, {
      answer,
      status,
      answered_by: user.full_name
    });

    // Create notification for the person who asked
    await base44.entities.Notification.create({
      message: `Ответ на ваш вопрос: "${ticket.question}"`,
      link: '/admin/tickets',
      is_read: false,
      category: 'ticket'
    }).catch(() => {});

    return Response.json({
      status: 'success',
      ticket_id,
      message: 'Ответ записан и отправлен'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});