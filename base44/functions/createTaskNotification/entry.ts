import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { agency_id, message, link, category } = body;

    if (!agency_id || !message) {
      return Response.json({ error: 'agency_id and message required' }, { status: 400 });
    }

    const agency = await base44.entities.Agency.get(agency_id);
    if (!agency) {
      return Response.json({ error: 'Agency not found' }, { status: 404 });
    }

    const notification = await base44.entities.Notification.create({
      agency_id,
      agency_name: agency.name,
      message,
      link: link || '/agency/workspace',
      is_read: false,
      category: category || 'card'
    });

    return Response.json({
      status: 'success',
      notification_id: notification.id,
      agency_name: agency.name,
      message: `Задача создана для агентства "${agency.name}"`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});