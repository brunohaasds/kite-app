const PRIMARY = "#0ea5e9";
const BG = "#f8fafc";
const TEXT = "#1e293b";
const MUTED = "#64748b";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function baseLayout(schoolName: string, bodyHtml: string): string {
  const safeSchool = escapeHtml(schoolName);
  return `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:${PRIMARY};padding:24px 20px;text-align:center;">
              <p style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.02em;">${safeSchool}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px;color:${TEXT};font-size:15px;line-height:1.65;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px;border-top:1px solid #e2e8f0;text-align:center;background:${BG};">
              <p style="margin:0;color:${MUTED};font-size:12px;">Powered by eKite</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function bookingConfirmation({
  studentName,
  date,
  time,
  instructorName,
  spotName,
  schoolName,
}: {
  studentName: string;
  date: string;
  time: string;
  instructorName: string;
  spotName: string;
  schoolName: string;
}): { subject: string; html: string } {
  const subject = `Confirmação de Aula - ${schoolName}`;
  const body = `
    <p style="margin:0 0 16px;color:${TEXT};">Olá <strong>${escapeHtml(studentName)}</strong>,</p>
    <p style="margin:0 0 20px;color:${MUTED};">A sua aula foi confirmada com os seguintes detalhes:</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px;background:${BG};border-radius:8px;border:1px solid #e2e8f0;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0 0 8px;color:${MUTED};font-size:13px;">Data e hora</p>
        <p style="margin:0;color:${TEXT};font-weight:600;">${escapeHtml(date)} · ${escapeHtml(time)}</p>
      </td></tr>
      <tr><td style="padding:0 16px 14px;">
        <p style="margin:0 0 8px;color:${MUTED};font-size:13px;">Instrutor</p>
        <p style="margin:0;color:${TEXT};">${escapeHtml(instructorName)}</p>
      </td></tr>
      <tr><td style="padding:0 16px 14px;">
        <p style="margin:0 0 8px;color:${MUTED};font-size:13px;">Local / spot</p>
        <p style="margin:0;color:${TEXT};">${escapeHtml(spotName)}</p>
      </td></tr>
    </table>
    <p style="margin:0;color:${MUTED};font-size:14px;">Até breve na água!</p>
  `;
  return { subject, html: baseLayout(schoolName, body) };
}

export function bookingReminder({
  studentName,
  date,
  time,
  instructorName,
  spotName,
  schoolName,
}: {
  studentName: string;
  date: string;
  time: string;
  instructorName: string;
  spotName: string;
  schoolName: string;
}): { subject: string; html: string } {
  const subject = `Lembrete: Aula amanhã - ${schoolName}`;
  const body = `
    <p style="margin:0 0 16px;color:${TEXT};">Olá <strong>${escapeHtml(studentName)}</strong>,</p>
    <p style="margin:0 0 20px;color:${MUTED};">Lembrete: tem aula marcada <strong style="color:${TEXT};">amanhã</strong>.</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 20px;background:${BG};border-radius:8px;border:1px solid #e2e8f0;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0 0 8px;color:${MUTED};font-size:13px;">Data e hora</p>
        <p style="margin:0;color:${TEXT};font-weight:600;">${escapeHtml(date)} · ${escapeHtml(time)}</p>
      </td></tr>
      <tr><td style="padding:0 16px 14px;">
        <p style="margin:0 0 8px;color:${MUTED};font-size:13px;">Instrutor</p>
        <p style="margin:0;color:${TEXT};">${escapeHtml(instructorName)}</p>
      </td></tr>
      <tr><td style="padding:0 16px 14px;">
        <p style="margin:0 0 8px;color:${MUTED};font-size:13px;">Local / spot</p>
        <p style="margin:0;color:${TEXT};">${escapeHtml(spotName)}</p>
      </td></tr>
    </table>
    <p style="margin:0;color:${MUTED};font-size:14px;">Boa sorte e divirta-se!</p>
  `;
  return { subject, html: baseLayout(schoolName, body) };
}

export function bookingCancellation({
  studentName,
  date,
  time,
  schoolName,
  reason,
}: {
  studentName: string;
  date: string;
  time: string;
  schoolName: string;
  reason?: string;
}): { subject: string; html: string } {
  const subject = `Aula Cancelada - ${schoolName}`;
  const reasonBlock =
    reason && reason.trim().length > 0
      ? `<p style="margin:20px 0 0;padding:12px 14px;background:${BG};border-left:3px solid ${PRIMARY};border-radius:0 8px 8px 0;color:${TEXT};font-size:14px;"><strong style="color:${MUTED};">Motivo:</strong> ${escapeHtml(reason.trim())}</p>`
      : "";
  const body = `
    <p style="margin:0 0 16px;color:${TEXT};">Olá <strong>${escapeHtml(studentName)}</strong>,</p>
    <p style="margin:0 0 20px;color:${MUTED};">Informamos que a seguinte aula foi <strong style="color:${TEXT};">cancelada</strong>:</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 8px;background:${BG};border-radius:8px;border:1px solid #e2e8f0;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0 0 8px;color:${MUTED};font-size:13px;">Data e hora</p>
        <p style="margin:0;color:${TEXT};font-weight:600;">${escapeHtml(date)} · ${escapeHtml(time)}</p>
      </td></tr>
    </table>
    ${reasonBlock}
    <p style="margin:24px 0 0;color:${MUTED};font-size:14px;">Em caso de dúvidas, contacte a escola.</p>
  `;
  return { subject, html: baseLayout(schoolName, body) };
}

export function welcomeEmail({
  studentName,
  schoolName,
  loginUrl,
}: {
  studentName: string;
  schoolName: string;
  loginUrl: string;
}): { subject: string; html: string } {
  const subject = `Bem-vindo à ${schoolName}!`;
  const safeUrl = escapeHtml(loginUrl);
  const body = `
    <p style="margin:0 0 16px;color:${TEXT};">Olá <strong>${escapeHtml(studentName)}</strong>,</p>
    <p style="margin:0 0 20px;color:${MUTED};">Bem-vindo à <strong style="color:${TEXT};">${escapeHtml(schoolName)}</strong>! A sua conta foi criada com sucesso.</p>
    <p style="margin:0 0 24px;color:${MUTED};">Pode aceder à plataforma para gerir as suas aulas e reservas:</p>
    <p style="margin:0;text-align:center;">
      <a href="${safeUrl}" style="display:inline-block;background:${PRIMARY};color:#ffffff;padding:14px 28px;border-radius:10px;font-size:15px;font-weight:600;text-decoration:none;">Entrar na eKite</a>
    </p>
    <p style="margin:24px 0 0;color:${MUTED};font-size:13px;text-align:center;">Se o botão não funcionar, copie e cole este link no navegador:<br/><span style="color:${PRIMARY};word-break:break-all;">${safeUrl}</span></p>
  `;
  return { subject, html: baseLayout(schoolName, body) };
}
