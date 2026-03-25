import { sendEmail } from "@/lib/emails/send";

interface InviteEmailParams {
  to: string;
  orgName: string;
  invitedByName: string;
  inviteUrl: string;
}

export async function sendInviteEmail({ to, orgName, invitedByName, inviteUrl }: InviteEmailParams) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:32px 24px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">eKite</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Gestão de escolas de kitesurf</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:32px 24px;">
                  <h2 style="margin:0 0 8px;font-size:20px;color:#18181b;">Você foi convidado!</h2>
                  <p style="margin:0 0 24px;color:#71717a;font-size:15px;line-height:1.6;">
                    <strong>${invitedByName}</strong> convidou você para fazer parte da escola
                    <strong>${orgName}</strong>.
                  </p>
                  <a href="${inviteUrl}" style="display:block;text-align:center;background:#0ea5e9;color:#ffffff;padding:14px 24px;border-radius:10px;font-size:16px;font-weight:600;text-decoration:none;">
                    Aceitar Convite
                  </a>
                  <p style="margin:24px 0 0;color:#a1a1aa;font-size:13px;text-align:center;">
                    Este convite expira em 7 dias.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:16px 24px;border-top:1px solid #e4e4e7;text-align:center;">
                  <p style="margin:0;color:#a1a1aa;font-size:12px;">
                    Se você não esperava este convite, pode ignorar este email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `${invitedByName} convidou você para ${orgName}`,
    html,
  });
}
