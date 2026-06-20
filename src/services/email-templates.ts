import { OfferDetail } from '@/types/offer';

export type EmailTemplateProps = {
  companyName: string;
  recipientName: string;
  subject: string;
  heading: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
  previewText?: string;
  badgeText?: string;
  warningText?: string;
  securityNote?: string;
  supportEmail?: string;
  footerText?: string;
};

const safe = (value: string) =>
  (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const safeUrl = (value: string) => safe(value.trim());

export function buildEmailHtml(props: EmailTemplateProps) {
  const brand = props.companyName || 'OLMS';
  const safeBrand = safe(brand);
  const preview = safe(props.previewText || `${props.heading} - ${props.body}`);
  const ctaUrl = props.ctaUrl ? safeUrl(props.ctaUrl) : '';
  const supportEmail = props.supportEmail ? safe(props.supportEmail) : 'support@olms.com';
  const warningText = props.warningText ? safe(props.warningText) : '';
  const securityNote = props.securityNote
    ? safe(props.securityNote)
    : 'For your security, this link can be used only once. If you did not request this email, you can safely ignore it.';
  const footerText = props.footerText
    ? safe(props.footerText)
    : `Need help? Contact ${supportEmail}.`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safe(props.subject)}</title>
    <style>
      body { margin: 0; padding: 0; background-color: #eef2f7; color: #0f172a; font-family: Inter, Arial, sans-serif; }
      .preview { display: none; max-height: 0; overflow: hidden; opacity: 0; color: transparent; }
      .container { width: 100%; padding: 28px 0; background-color: #eef2f7; }
      .card { max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #dbe3ee; border-radius: 24px; box-shadow: 0 20px 60px rgba(15,23,42,0.12); }
      .inner { padding: 32px; }
      .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
      .brand { font-size: 0.9rem; letter-spacing: 0.16em; text-transform: uppercase; color: #0284c7; font-weight: 800; }
      .badge { border-radius: 9999px; background: #e0f2fe; color: #075985; display: inline-block; font-size: 0.78rem; font-weight: 700; padding: 8px 12px; }
      .title { font-size: 2rem; line-height: 1.15; color: #0f172a; margin: 0; }
      .body { margin-top: 24px; color: #334155; line-height: 1.75; font-size: 1rem; }
      .button { display: inline-block; margin-top: 32px; padding: 14px 24px; background: #0284c7; color: #ffffff !important; border-radius: 9999px; text-decoration: none; font-weight: 800; }
      .warning { margin-top: 24px; padding: 16px; border-radius: 16px; background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; line-height: 1.6; }
      .linkBox { margin-top: 24px; padding: 16px; border-radius: 16px; background: #f8fafc; border: 1px solid #dbe3ee; word-break: break-all; color: #334155; }
      .linkBox a { color: #0369a1; }
      .security { margin-top: 24px; padding: 16px; border-radius: 16px; background: #ecfeff; border: 1px solid #a5f3fc; color: #155e75; line-height: 1.6; }
      .footer { margin-top: 40px; color: #64748b; font-size: 0.95rem; line-height: 1.7; }
      .footer a { color: #0369a1; }
      @media (max-width: 600px) { .inner { padding: 24px; } .title { font-size: 1.75rem; } }
      @media (prefers-color-scheme: dark) {
        body, .container { background-color: #0f172a; color: #e2e8f0; }
        .card { background: #111827; border-color: #263244; box-shadow: none; }
        .brand { color: #67e8f9; }
        .badge { background: rgba(14,165,233,0.14); color: #7dd3fc; }
        .title { color: #ffffff; }
        .body { color: #cbd5e1; }
        .linkBox { background: #020617; border-color: #263244; color: #cbd5e1; }
        .linkBox a { color: #67e8f9; }
        .security { background: rgba(8,145,178,0.14); border-color: rgba(103,232,249,0.25); color: #a5f3fc; }
        .warning { background: rgba(251,146,60,0.12); border-color: rgba(251,146,60,0.25); color: #fed7aa; }
        .footer { color: #94a3b8; }
        .footer a { color: #67e8f9; }
      }
    </style>
  </head>
  <body>
    <div class="preview">${preview}</div>
    <div class="container">
      <div class="card" role="article" aria-label="${safe(props.subject)}">
        <div class="inner">
          <div class="header">
            <div class="brand">${safeBrand}</div>
            ${props.badgeText ? `<div class="badge">${safe(props.badgeText)}</div>` : ''}
          </div>
          <h1 class="title">${safe(props.heading)}</h1>
          <div class="body">${safe(props.body).replace(/\n/g, '<br />')}</div>
          ${props.ctaText && ctaUrl ? `<a href="${ctaUrl}" class="button">${safe(props.ctaText)}</a>` : ''}
          ${warningText ? `<div class="warning">${warningText}</div>` : ''}
          ${ctaUrl ? `<div class="linkBox"><strong>Secure link:</strong><br /><a href="${ctaUrl}">${ctaUrl}</a></div>` : ''}
          <div class="security"><strong>Security note:</strong> ${securityNote}</div>
          <div class="footer">
            <p>${footerText}</p>
            <p>${safeBrand} transactional email</p>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

export function buildPlainTextEmail(props: EmailTemplateProps) {
  const cta = props.ctaText && props.ctaUrl ? `\n\n${props.ctaText}: ${props.ctaUrl}` : '';
  const warning = props.warningText ? `\n\n${props.warningText}` : '';
  const security = props.securityNote ? `\n\nSecurity note: ${props.securityNote}` : '';
  const support = props.supportEmail ? `\n\nSupport: ${props.supportEmail}` : '';
  return `${props.subject}\n\n${props.heading}\n\n${props.body}${cta}${warning}${security}${support}\n\n${props.companyName}`;
}

export function buildOfferCreatedTemplate(offer: OfferDetail, companyName: string, recipientName: string, ctaUrl: string) {
  const subject = `Offer created: ${offer.title}`;
  const heading = `New offer created for ${offer.candidateName}`;
  const body = `Your offer ${offer.title} for ${offer.candidateName} has been created and is scheduled for review. You can manage approvals and release details from the workflow dashboard.`;

  return {
    subject,
    html: buildEmailHtml({ companyName, recipientName, subject, heading, body, ctaText: 'View offer', ctaUrl }),
    text: buildPlainTextEmail({ companyName, recipientName, subject, heading, body, ctaText: 'View offer', ctaUrl }),
  };
}

export function buildApprovalRequestTemplate(offer: OfferDetail, companyName: string, recipientName: string, ctaUrl: string) {
  const subject = `Approval requested: ${offer.title}`;
  const heading = `Approval required for ${offer.title}`;
  const body = `A new approval request has been submitted for ${offer.candidateName} in ${offer.departmentName}. Please review the offer details and take action before the approval window closes.`;

  return {
    subject,
    html: buildEmailHtml({ companyName, recipientName, subject, heading, body, ctaText: 'Review approval', ctaUrl }),
    text: buildPlainTextEmail({ companyName, recipientName, subject, heading, body, ctaText: 'Review approval', ctaUrl }),
  };
}

export function buildApprovalCompletedTemplate(offer: OfferDetail, companyName: string, recipientName: string, decision: string, ctaUrl: string) {
  const subject = `Approval ${decision.toLowerCase()}: ${offer.title}`;
  const heading = `Approval ${decision.toLowerCase()} for ${offer.title}`;
  const body = `The approval workflow for ${offer.candidateName} has been marked ${decision.toLowerCase()}. Review the updated offer status and next steps in the workflow dashboard.`;

  return {
    subject,
    html: buildEmailHtml({ companyName, recipientName, subject, heading, body, ctaText: 'View offer', ctaUrl }),
    text: buildPlainTextEmail({ companyName, recipientName, subject, heading, body, ctaText: 'View offer', ctaUrl }),
  };
}

export function buildOfferReleasedTemplate(offer: OfferDetail, companyName: string, recipientName: string, ctaUrl: string) {
  const subject = `Offer released: ${offer.title}`;
  const heading = `Your offer is ready for candidate review`;
  const body = `The offer for ${offer.candidateName} has been released and is ready for candidate acceptance. Keep the workflow moving by tracking candidate responses from the offer dashboard.`;

  return {
    subject,
    html: buildEmailHtml({ companyName, recipientName, subject, heading, body, ctaText: 'View released offer', ctaUrl }),
    text: buildPlainTextEmail({ companyName, recipientName, subject, heading, body, ctaText: 'View released offer', ctaUrl }),
  };
}

export function buildOfferStatusUpdateTemplate(offer: OfferDetail, companyName: string, recipientName: string, decision: string, ctaUrl: string) {
  const subject = `Offer ${decision.toLowerCase()}: ${offer.title}`;
  const heading = `Offer ${decision.toLowerCase()} for ${offer.candidateName}`;
  const body = `The offer for ${offer.candidateName} has been ${decision.toLowerCase()}. Review the final workflow notes and take any follow-up actions from the dashboard.`;

  return {
    subject,
    html: buildEmailHtml({ companyName, recipientName, subject, heading, body, ctaText: 'View offer', ctaUrl }),
    text: buildPlainTextEmail({ companyName, recipientName, subject, heading, body, ctaText: 'View offer', ctaUrl }),
  };
}

export function buildOfferExpiringTemplate(offer: OfferDetail, companyName: string, recipientName: string, ctaUrl: string) {
  const subject = `Offer expiring soon: ${offer.title}`;
  const heading = `Offer expiring within 72 hours`;
  const body = `The pending offer for ${offer.candidateName} will expire soon. Review the workflow and take any necessary action to keep the offer on schedule.`;

  return {
    subject,
    html: buildEmailHtml({ companyName, recipientName, subject, heading, body, ctaText: 'View offer', ctaUrl }),
    text: buildPlainTextEmail({ companyName, recipientName, subject, heading, body, ctaText: 'View offer', ctaUrl }),
  };
}

export function buildReminderTemplate(title: string, message: string, companyName: string, recipientName: string, ctaUrl: string) {
  const subject = `Reminder: ${title}`;
  const heading = title;
  const body = message;

  return {
    subject,
    html: buildEmailHtml({ companyName, recipientName, subject, heading, body, ctaText: 'Review reminder', ctaUrl }),
    text: buildPlainTextEmail({ companyName, recipientName, subject, heading, body, ctaText: 'Review reminder', ctaUrl }),
  };
}

export function buildOnboardingTemplate(offer: OfferDetail, companyName: string, recipientName: string, ctaUrl: string) {
  const subject = `Welcome aboard: ${offer.candidateName}`;
  const heading = `New hire onboarding triggered`;
  const body = `The offer for ${offer.candidateName} has been accepted. Start the onboarding workflow and welcome the new hire to ${companyName}.`;

  return {
    subject,
    html: buildEmailHtml({ companyName, recipientName, subject, heading, body, ctaText: 'View onboarding', ctaUrl }),
    text: buildPlainTextEmail({ companyName, recipientName, subject, heading, body, ctaText: 'View onboarding', ctaUrl }),
  };
}

export function buildPasswordResetTemplate(companyName: string, recipientName: string, resetLink: string) {
  const subject = 'Reset your OLMS password';
  const heading = 'Password reset request';
  const body = `Hi ${recipientName},\n\nWe received a request to reset your OLMS password. Use the secure button below to create a new password for your account.`;
  const warningText = 'This password reset link expires in 15 minutes.';
  const securityNote = 'This link can be used only once. OLMS will never ask you to reply with your password or share it over email.';

  return {
    subject,
    html: buildEmailHtml({
      companyName,
      recipientName,
      subject,
      heading,
      body,
      ctaText: 'Reset password',
      ctaUrl: resetLink,
      previewText: 'Reset your OLMS password',
      badgeText: 'Account security',
      warningText,
      securityNote,
      supportEmail: process.env.SMTP_SUPPORT_EMAIL || 'support@olms.com',
    }),
    text: buildPlainTextEmail({
      companyName,
      recipientName,
      subject,
      heading,
      body,
      ctaText: 'Reset password',
      ctaUrl: resetLink,
      warningText,
      securityNote,
      supportEmail: process.env.SMTP_SUPPORT_EMAIL || 'support@olms.com',
    }),
  };
}
