import cron from 'node-cron';
import { startEmailQueue } from '@/services/email-queue';
import { runExpiringOfferAutomation, runOverdueApprovalsAutomation, runStaleCandidatesAutomation, runRecruiterReminderAutomation, runCleanupAutomation } from '@/services/automation-service';

const SCHEDULER_IDENTIFIER = '__OLMS_AUTOMATION_SCHEDULER_STARTED';

declare global {
  var __OLMS_AUTOMATION_SCHEDULER_STARTED: boolean | undefined;
}

function safeSchedule(expression: string, task: () => Promise<void>) {
  cron.schedule(expression, async () => {
    try {
      await task();
    } catch (error) {
      console.error('Automation job failed:', error);
    }
  });
}

export function initializeAutomationScheduler() {
  if ((globalThis as any)[SCHEDULER_IDENTIFIER]) {
    return;
  }

  (globalThis as any)[SCHEDULER_IDENTIFIER] = true;

  startEmailQueue();

  safeSchedule('0 */6 * * *', runExpiringOfferAutomation);
  safeSchedule('0 8 * * *', runOverdueApprovalsAutomation);
  safeSchedule('30 9 * * *', runStaleCandidatesAutomation);
  safeSchedule('0 10 * * 1', runRecruiterReminderAutomation);
  safeSchedule('0 3 * * *', runCleanupAutomation);
}
