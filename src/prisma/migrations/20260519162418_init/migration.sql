-- DropIndex
DROP INDEX "OfferTemplate_isActive_isArchived_idx";

-- AlterTable
ALTER TABLE "AppSetting" ADD COLUMN     "automationApprovalReminderHours" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "automationCleanupDays" INTEGER NOT NULL DEFAULT 90,
ADD COLUMN     "automationEmailReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "automationExpiryThresholdDays" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "automationStaleCandidateDays" INTEGER NOT NULL DEFAULT 14;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "templateVersionId" TEXT;

-- AlterTable
ALTER TABLE "OfferTemplate" ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "eventKey" TEXT,
    "entityId" TEXT,
    "details" JSONB,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailLog_recipient_idx" ON "EmailLog"("recipient");

-- CreateIndex
CREATE INDEX "EmailLog_eventKey_idx" ON "EmailLog"("eventKey");

-- CreateIndex
CREATE INDEX "EmailLog_entityId_idx" ON "EmailLog"("entityId");

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_candidateId_idx" ON "Activity"("candidateId");

-- CreateIndex
CREATE INDEX "Activity_offerId_idx" ON "Activity"("offerId");

-- CreateIndex
CREATE INDEX "Approval_offerId_idx" ON "Approval"("offerId");

-- CreateIndex
CREATE INDEX "Approval_approverId_idx" ON "Approval"("approverId");

-- CreateIndex
CREATE INDEX "Attachment_ownerId_idx" ON "Attachment"("ownerId");

-- CreateIndex
CREATE INDEX "Attachment_candidateId_idx" ON "Attachment"("candidateId");

-- CreateIndex
CREATE INDEX "Attachment_offerId_idx" ON "Attachment"("offerId");

-- CreateIndex
CREATE INDEX "Candidate_departmentId_idx" ON "Candidate"("departmentId");

-- CreateIndex
CREATE INDEX "Candidate_recruiterId_idx" ON "Candidate"("recruiterId");

-- CreateIndex
CREATE INDEX "Candidate_status_idx" ON "Candidate"("status");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_entityId_idx" ON "Notification"("entityId");

-- CreateIndex
CREATE INDEX "Offer_candidateId_idx" ON "Offer"("candidateId");

-- CreateIndex
CREATE INDEX "Offer_createdById_idx" ON "Offer"("createdById");

-- CreateIndex
CREATE INDEX "Offer_templateId_idx" ON "Offer"("templateId");

-- CreateIndex
CREATE INDEX "Offer_templateVersionId_idx" ON "Offer"("templateVersionId");

-- CreateIndex
CREATE INDEX "Offer_departmentId_idx" ON "Offer"("departmentId");

-- CreateIndex
CREATE INDEX "Offer_status_idx" ON "Offer"("status");

-- CreateIndex
CREATE INDEX "Offer_offerDate_idx" ON "Offer"("offerDate");

-- CreateIndex
CREATE INDEX "Offer_validUntil_idx" ON "Offer"("validUntil");

-- CreateIndex
CREATE INDEX "OfferTemplate_createdById_idx" ON "OfferTemplate"("createdById");

-- CreateIndex
CREATE INDEX "OfferTemplate_isActive_isArchived_isDraft_idx" ON "OfferTemplate"("isActive", "isArchived", "isDraft");

-- CreateIndex
CREATE INDEX "TemplateVersion_createdById_idx" ON "TemplateVersion"("createdById");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_templateVersionId_fkey" FOREIGN KEY ("templateVersionId") REFERENCES "TemplateVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
