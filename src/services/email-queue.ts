import { sendEmail } from '@/services/email-service';

type EmailQueueItem = {
  recipient: string;
  recipientName: string;
  subject: string;
  html: string;
  text: string;
  eventKey?: string;
  entityId?: string;
  retryCount: number;
  metadata?: Record<string, unknown>;
};

const queue: EmailQueueItem[] = [];
let active = false;
let intervalHandle: NodeJS.Timeout | null = null;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function enqueueEmail(item: Omit<EmailQueueItem, 'retryCount'>) {
  queue.push({ ...item, retryCount: 0 });
  await processQueue();
}

async function processQueue() {
  if (active) {
    return;
  }

  active = true;

  while (queue.length) {
    const job = queue.shift();
    if (!job) {
      continue;
    }

    try {
      await sendEmail({
        recipient: job.recipient,
        recipientName: job.recipientName,
        subject: job.subject,
        html: job.html,
        text: job.text,
        eventKey: job.eventKey,
        entityId: job.entityId,
      });
    } catch (error) {
      if (job.retryCount < 3) {
        queue.push({ ...job, retryCount: job.retryCount + 1 });
        await delay(5000 * (job.retryCount + 1));
      }
    }
  }

  active = false;
}

export function startEmailQueue() {
  if (intervalHandle) {
    return;
  }

  intervalHandle = setInterval(() => {
    void processQueue();
  }, 15000);
}

export function getEmailQueueSize() {
  return queue.length;
}
