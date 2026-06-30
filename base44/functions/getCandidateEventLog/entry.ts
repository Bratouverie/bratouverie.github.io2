import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { event_type = 'all', period = 'today' } = body;

    const logs = await base44.entities.CandidateLog.list('-timestamp', 500);

    const now = new Date();
    let startTime = new Date();

    if (period === 'today') {
      startTime.setHours(0, 0, 0, 0);
    } else if (period === 'yesterday') {
      startTime.setDate(now.getDate() - 1);
      startTime.setHours(0, 0, 0, 0);
    } else if (period === 'week') {
      startTime.setDate(now.getDate() - 7);
    }

    let filtered = logs.filter(log => {
      if (!log.timestamp) return false;
      const logTime = new Date(log.timestamp);
      return logTime >= startTime;
    });

    if (event_type !== 'all') {
      filtered = filtered.filter(log => log.action === event_type);
    }

    const grouped = filtered.reduce((acc: any, log) => {
      const date = new Date(log.timestamp).toLocaleDateString('ru-RU');
      if (!acc[date]) acc[date] = [];
      acc[date].push({
        time: new Date(log.timestamp).toLocaleTimeString('ru-RU'),
        candidate: log.candidate_name,
        action: log.action,
        changed_by: log.changed_by_name,
        role: log.changed_by_role,
        changes: log.changes ? JSON.parse(log.changes) : null
      });
      return acc;
    }, {});

    return Response.json({
      status: 'success',
      period,
      event_type,
      total_events: filtered.length,
      events_by_date: grouped
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});