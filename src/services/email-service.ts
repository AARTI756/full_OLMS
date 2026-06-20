import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';
import { prisma } from '@/prisma/client';
import { decryptValue } from '@/lib/crypto';
import { getSettings } from '@/services/settings-service';
import { buildEmailHtml, buildPasswordResetTemplate, buildPlainTextEmail } from '@/services/email-templates';
import { recordEmailLog, hasEmailEventBeenSent } from '@/services/email-log-service';
import type { OfferDetail } from '@/types/offer';

const transporterCache: { transport: nodemailer.Transporter | null } = { transport: null };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeHost(value: string | null | undefined) {
  return value?.trim() || undefined;
}

async function createTransporter() {
  if (transporterCache.transport) {
    return transporterCache.transport;
  }

  const settings = await getSettings();
  const rawSettings = await prisma.appSetting.findFirst();
  const gmailUser = process.env.EMAIL_USER;
  const envHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || (gmailUser ? 'smtp.gmail.com' : undefined);
  const envPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || (gmailUser ? 465 : 0));
  const host = normalizeHost(settings.smtpHost) || envHost;
  const port = settings.smtpPort ?? (envPort || undefined);
  const user = settings.smtpUser || process.env.SMTP_USER || gmailUser;
  const pass = rawSettings?.smtpPasswordEncrypted
    ? decryptValue(rawSettings.smtpPasswordEncrypted)
    : process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP configuration is incomplete. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM, or use EMAIL_USER and EMAIL_PASSWORD for Gmail development.');
  }

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // Gmail SMTP uses SSL on 465; use STARTTLS on 587.
    requireTLS: port !== 465,
    auth: {
      user,
      pass,
    },
  });

  transporterCache.transport = transport;
  return transport;
}

function createFromAddress(settings: Awaited<ReturnType<typeof getSettings>>) {
  const configuredFrom = settings.smtpFromEmail || process.env.SMTP_FROM || process.env.EMAIL_FROM;
  if (configuredFrom?.includes('<')) {
    return configuredFrom;
  }

  const fromAddress = configuredFrom || process.env.EMAIL_USER || `noreply@${settings.companyName?.replace(/\s+/g, '').toLowerCase() || 'olms'}.com`;
  const fromName = settings.smtpFromName || settings.companyName || 'OLMS';
  return `${fromName} <${fromAddress}>`;
}

function getEmailErrorDetails(error: unknown) {
  const smtpError = error as { code?: string; command?: string; response?: string; responseCode?: number; message?: string };

  return {
    error: error instanceof Error ? error.message : String(error),
    code: smtpError.code,
    command: smtpError.command,
    response: smtpError.response,
    responseCode: smtpError.responseCode,
  };
}

export type EmailSendRequest = {
  recipient: string;
  recipientName: string;
  subject: string;
  html: string;
  text: string;
  eventKey?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  skipDuplicateCheck?: boolean;
};

export async function sendEmail(request: EmailSendRequest) {
  const recipient = request.recipient.trim().toLowerCase();

  if (!request.skipDuplicateCheck && request.eventKey && request.entityId) {
    const alreadySent = await hasEmailEventBeenSent(recipient, request.eventKey, request.entityId);
    if (alreadySent) {
      return;
    }
  }

  try {
    if (!emailPattern.test(recipient)) {
      throw new Error('Invalid recipient email address');
    }

    const settings = await getSettings();
    const transport = await createTransporter();
    const from = createFromAddress(settings);
    const mailOptions: SendMailOptions = {
      from,
      to: recipient,
      subject: request.subject,
      html: request.html,
      text: request.text,
    };
    const result = await transport.sendMail(mailOptions);

    await recordEmailLog({
      recipient,
      subject: request.subject,
      status: 'SENT',
      eventKey: request.eventKey ?? null,
      entityId: request.entityId ?? null,
      details: {
        eventType: request.eventKey ?? 'TRANSACTIONAL_EMAIL',
        recipientName: request.recipientName,
        accepted: result.accepted,
        rejected: result.rejected,
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
        ...request.metadata,
      },
    });

    return result;
  } catch (error) {
    await recordEmailLog({
      recipient,
      subject: request.subject,
      status: 'FAILED',
      eventKey: request.eventKey ?? null,
      entityId: request.entityId ?? null,
      details: {
        eventType: request.eventKey ?? 'TRANSACTIONAL_EMAIL',
        recipientName: request.recipientName,
        timestamp: new Date().toISOString(),
        ...getEmailErrorDetails(error),
        ...request.metadata,
      },
    });

    throw error;
  }
}

export async function queueTransactionalEmail(request: EmailSendRequest) {
  const { enqueueEmail } = await import('./email-queue');
  await enqueueEmail(request);
}

export async function sendPasswordResetEmail(params: {
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  resetLink: string;
}) {
  const template = buildPasswordResetTemplate(params.companyName, params.recipientName, params.resetLink);

  return sendEmail({
    recipient: params.recipientEmail,
    recipientName: params.recipientName,
    subject: template.subject,
    html: template.html,
    text: template.text,
    eventKey: 'PASSWORD_RESET_REQUEST',
    entityId: params.recipientEmail.toLowerCase(),
    skipDuplicateCheck: true,
    metadata: { workflow: 'forgot-password' },
  });
}

export async function sendOfferLetterEmail(params: {
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  offerTitle: string;
  ctaUrl: string;
  entityId: string;
}) {
  const subject = `Offer letter: ${params.offerTitle}`;
  const heading = 'Your offer letter is ready';
  const body = `Hi ${params.recipientName},\n\nYour offer letter for ${params.offerTitle} is ready for review. Open the secure link below to view the details.`;

  const html = buildEmailHtml({
    companyName: params.companyName,
    recipientName: params.recipientName,
    subject,
    heading,
    body,
    ctaText: 'View offer letter',
    ctaUrl: params.ctaUrl,
    badgeText: 'Offer letter',
    securityNote: 'For privacy, only open this link on a device you trust.',
  });

  return queueTransactionalEmail({
    recipient: params.recipientEmail,
    recipientName: params.recipientName,
    subject,
    html,
    text: buildPlainTextEmail({
      companyName: params.companyName,
      recipientName: params.recipientName,
      subject,
      heading,
      body,
      ctaText: 'View offer letter',
      ctaUrl: params.ctaUrl,
    }),
    eventKey: 'OFFER_LETTER',
    entityId: params.entityId,
  });
}

export async function sendNotificationEmail(params: {
  recipientEmail: string;
  recipientName: string;
  companyName: string;
  title: string;
  message: string;
  ctaUrl?: string;
  entityId?: string;
  eventKey?: string;
}) {
  const html = buildEmailHtml({
    companyName: params.companyName,
    recipientName: params.recipientName,
    subject: params.title,
    heading: params.title,
    body: params.message,
    ctaText: params.ctaUrl ? 'Open OLMS' : undefined,
    ctaUrl: params.ctaUrl,
    badgeText: 'Notification',
  });

  return queueTransactionalEmail({
    recipient: params.recipientEmail,
    recipientName: params.recipientName,
    subject: params.title,
    html,
    text: buildPlainTextEmail({
      companyName: params.companyName,
      recipientName: params.recipientName,
      subject: params.title,
      heading: params.title,
      body: params.message,
      ctaText: params.ctaUrl ? 'Open OLMS' : undefined,
      ctaUrl: params.ctaUrl,
    }),
    eventKey: params.eventKey ?? 'NOTIFICATION',
    entityId: params.entityId,
  });
}

export async function sendOfferCreatedEmail(offer: OfferDetail, recipientName: string, recipientEmail: string, ctaUrl: string) {
  const template = buildEmailHtml({
    companyName: offer.departmentName,
    recipientName,
    subject: `Offer created: ${offer.title}`,
    heading: `New offer created for ${offer.candidateName}`,
    body: `Your offer ${offer.title} has been created and is ready for the next approval and release step.`,
    ctaText: 'View offer',
    ctaUrl,
    previewText: `Offer created for ${offer.candidateName}`,
  });

  await queueTransactionalEmail({
    recipient: recipientEmail,
    recipientName,
    subject: `Offer created: ${offer.title}`,
    html: template,
    text: buildPlainTextEmail({
      companyName: offer.departmentName,
      recipientName,
      subject: `Offer created: ${offer.title}`,
      heading: `New offer created for ${offer.candidateName}`,
      body: `Your offer ${offer.title} has been created and is ready for the next approval and release step.`,
      ctaText: 'View offer',
      ctaUrl,
    }),
    eventKey: 'OFFER_CREATED',
    entityId: offer.id,
  });
}

export async function sendApprovalRequestEmail(offer: OfferDetail, recipientName: string, recipientEmail: string, ctaUrl: string) {
  const template = buildEmailHtml({
    companyName: offer.departmentName,
    recipientName,
    subject: `Approval requested: ${offer.title}`,
    heading: `Approval required for ${offer.title}`,
    body: `A new approval request is waiting for your review for candidate ${offer.candidateName}. Please approve or reject the offer before the workflow window closes.`,
    ctaText: 'Review approval',
    ctaUrl,
    previewText: `Approval requested for ${offer.candidateName}`,
  });

  await queueTransactionalEmail({
    recipient: recipientEmail,
    recipientName,
    subject: `Approval requested: ${offer.title}`,
    html: template,
    text: buildPlainTextEmail({
      companyName: offer.departmentName,
      recipientName,
      subject: `Approval requested: ${offer.title}`,
      heading: `Approval required for ${offer.title}`,
      body: `A new approval request is waiting for your review for candidate ${offer.candidateName}.`,
      ctaText: 'Review approval',
      ctaUrl,
    }),
    eventKey: 'OFFER_APPROVAL_REQUESTED',
    entityId: offer.id,
  });
}

export async function sendApprovalCompletedEmail(offer: OfferDetail, decision: string, recipientName: string, recipientEmail: string, ctaUrl: string) {
  const template = buildEmailHtml({
    companyName: offer.departmentName,
    recipientName,
    subject: `Approval ${decision.toLowerCase()}: ${offer.title}`,
    heading: `Approval ${decision.toLowerCase()} for ${offer.title}`,
    body: `The approval workflow for ${offer.candidateName} has been ${decision.toLowerCase()}. Review the updated offer details in the workflow dashboard.`,
    ctaText: 'View offer',
    ctaUrl,
    previewText: `Approval ${decision.toLowerCase()} for ${offer.candidateName}`,
  });

  await queueTransactionalEmail({
    recipient: recipientEmail,
    recipientName,
    subject: `Approval ${decision.toLowerCase()}: ${offer.title}`,
    html: template,
    text: buildPlainTextEmail({
      companyName: offer.departmentName,
      recipientName,
      subject: `Approval ${decision.toLowerCase()}: ${offer.title}`,
      heading: `Approval ${decision.toLowerCase()} for ${offer.title}`,
      body: `The approval workflow for ${offer.candidateName} has been ${decision.toLowerCase()}.`,
      ctaText: 'View offer',
      ctaUrl,
    }),
    eventKey: `OFFER_APPROVAL_${decision.toUpperCase()}`,
    entityId: offer.id,
  });
}

export async function sendOfferStatusNotificationEmail(offer: OfferDetail, status: string, recipientName: string, recipientEmail: string, ctaUrl: string) {
  const template = buildEmailHtml({
    companyName: offer.departmentName,
    recipientName,
    subject: `Offer ${status.toLowerCase()}: ${offer.title}`,
    heading: `Offer ${status.toLowerCase()} for ${offer.title}`,
    body: `The offer for ${offer.candidateName} has been ${status.toLowerCase()}. Review the workflow details and next steps on your dashboard.`,
    ctaText: 'View offer',
    ctaUrl,
    previewText: `Offer ${status.toLowerCase()} for ${offer.candidateName}`,
  });

  await queueTransactionalEmail({
    recipient: recipientEmail,
    recipientName,
    subject: `Offer ${status.toLowerCase()}: ${offer.title}`,
    html: template,
    text: buildPlainTextEmail({
      companyName: offer.departmentName,
      recipientName,
      subject: `Offer ${status.toLowerCase()}: ${offer.title}`,
      heading: `Offer ${status.toLowerCase()} for ${offer.title}`,
      body: `The offer for ${offer.candidateName} has been ${status.toLowerCase()}.`,
      ctaText: 'View offer',
      ctaUrl,
    }),
    eventKey: `OFFER_${status.toUpperCase()}`,
    entityId: offer.id,
  });
}

export async function sendOfferExpiringEmail(offer: OfferDetail, recipientName: string, recipientEmail: string, ctaUrl: string) {
  const template = buildEmailHtml({
    companyName: offer.departmentName,
    recipientName,
    subject: `Offer expiring soon: ${offer.title}`,
    heading: `Offer expiring within 72 hours`,
    body: `The offer for ${offer.candidateName} is approaching its expiration date. Review the details and act quickly to keep the workflow on track.`,
    ctaText: 'View expiring offer',
    ctaUrl,
    previewText: `Offer expiring soon for ${offer.candidateName}`,
  });

  await queueTransactionalEmail({
    recipient: recipientEmail,
    recipientName,
    subject: `Offer expiring soon: ${offer.title}`,
    html: template,
    text: buildPlainTextEmail({
      companyName: offer.departmentName,
      recipientName,
      subject: `Offer expiring soon: ${offer.title}`,
      heading: `Offer expiring within 72 hours`,
      body: `The offer for ${offer.candidateName} is approaching its expiration date.`,
      ctaText: 'View expiring offer',
      ctaUrl,
    }),
    eventKey: 'OFFER_EXPIRING',
    entityId: offer.id,
  });
}

export async function sendReminderEmail(title: string, message: string, companyName: string, recipientName: string, recipientEmail: string, ctaUrl: string, entityId: string) {
  const template = buildEmailHtml({
    companyName,
    recipientName,
    subject: title,
    heading: title,
    body: message,
    ctaText: 'Review reminder',
    ctaUrl,
    previewText: message,
  });

  await queueTransactionalEmail({
    recipient: recipientEmail,
    recipientName,
    subject: title,
    html: template,
    text: buildPlainTextEmail({
      companyName,
      recipientName,
      subject: title,
      heading: title,
      body: message,
      ctaText: 'Review reminder',
      ctaUrl,
    }),
    eventKey: `REMINDER_${entityId}`,
    entityId,
  });
}
