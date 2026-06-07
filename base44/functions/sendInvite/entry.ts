import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Доступ запрещён' }, { status: 403 });
    }

    const { email, agencyName, password } = await req.json();
    if (!email || !password) {
      return Response.json({ error: 'Не указаны email или пароль' }, { status: 400 });
    }

    const subject = `Доступ к системе управления — ${agencyName || 'Братоуверие-СНБ'}`;

    const body = `
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Доступ к системе</title>
</head>
<body style="margin:0;padding:0;background-color:#05070A;font-family:'Arial',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#05070A;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#0D1B3E 0%,#05070A 100%);border:1px solid rgba(123,63,191,0.25);border-radius:16px;overflow:hidden;max-width:580px;">
          <!-- Top bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#7B3FBF,#C9A84C,#7B3FBF);height:3px;"></td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 30px;text-align:center;border-bottom:1px solid rgba(123,63,191,0.12);">
              <img src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/86d4247bb_2_2.png"
                width="56" height="56" alt="Братоуверие-СНБ" style="display:block;margin:0 auto 16px;" />
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;">
                Братоуверие-СНБ
              </p>
              <h1 style="margin:0;font-size:22px;font-weight:900;color:#F8FAFC;letter-spacing:-0.03em;">
                Добро пожаловать в систему
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;font-size:15px;color:rgba(248,250,252,0.7);line-height:1.6;">
                Здравствуйте!
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:rgba(248,250,252,0.7);line-height:1.6;">
                ${agencyName ? `Для кадрового агентства <strong style="color:#F8FAFC;">${agencyName}</strong> был создан аккаунт` : 'Для вас был создан аккаунт'} в системе управления кандидатами ООО «Братоуверие-СНБ». Вы можете войти, используя следующие данные:
              </p>
              <!-- Credentials box -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:rgba(123,63,191,0.08);border:1px solid rgba(123,63,191,0.25);border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:14px;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(248,250,252,0.35);">Логин (Email)</p>
                          <p style="margin:0;font-size:15px;font-weight:700;color:#F8FAFC;">${email}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="border-top:1px solid rgba(123,63,191,0.15);padding-top:14px;">
                          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(248,250,252,0.35);">Пароль</p>
                          <p style="margin:0;font-size:18px;font-weight:900;color:#C9A84C;letter-spacing:0.08em;font-family:'Courier New',monospace;">${password}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://bratouverie-snb.ru/login"
                      style="display:inline-block;padding:14px 36px;background-color:#7B3FBF;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;border-radius:10px;letter-spacing:0.04em;">
                      Войти в систему →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:12px;color:rgba(248,250,252,0.3);text-align:center;line-height:1.6;">
                Рекомендуем сменить пароль после первого входа.<br>
                Если вы не запрашивали доступ, проигнорируйте это письмо.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(123,63,191,0.10);text-align:center;">
              <p style="margin:0;font-size:11px;color:rgba(248,250,252,0.2);">
                ООО «Братоуверие-СНБ» · <a href="https://bratouverie-snb.ru" style="color:rgba(201,168,76,0.5);text-decoration:none;">bratouverie-snb.ru</a>
              </p>
              <p style="margin:6px 0 0;font-size:10px;color:rgba(248,250,252,0.12);">
                ИНН 2511135442 · Приморский край, г. Уссурийск, пер. Мирный, д.1
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject,
      body,
      from_name: 'Братоуверие-СНБ',
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});