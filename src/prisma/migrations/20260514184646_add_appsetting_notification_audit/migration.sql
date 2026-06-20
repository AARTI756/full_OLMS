/*
  Warnings:

  - You are about to drop the column `category` on the `OfferTemplate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[latestVersionId]` on the table `OfferTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CandidateActivityType" AS ENUM ('CREATED', 'UPDATED', 'RESUME_UPLOADED', 'NOTE_ADDED', 'NOTE_UPDATED', 'NOTE_DELETED', 'STATUS_CHANGED', 'DELETED');

-- AlterTable
ALTER TABLE "OfferTemplate" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "latestVersionId" TEXT;

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyWebsite" TEXT,
    "companyEmail" TEXT,
    "companyPhone" TEXT,
    "companyAddress" TEXT,
    "brandingLogoUrl" TEXT,
    "brandingPrimaryColor" TEXT,
    "brandingSecondaryColor" TEXT,
    "smtpHost" TEXT,
    "smtpPort" INTEGER,
    "smtpUser" TEXT,
    "smtpFromName" TEXT,
    "smtpFromEmail" TEXT,
    "smtpSecure" BOOLEAN NOT NULL DEFAULT true,
    "smtpPasswordEncrypted" TEXT,
    "notificationOfferEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificationCandidateEmail" BOOLEAN NOT NULL DEFAULT true,
    "notificationSystemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "notificationDigestFrequency" TEXT NOT NULL DEFAULT 'daily',
    "offerApprovalRequired" BOOLEAN NOT NULL DEFAULT true,
    "offerAutoRelease" BOOLEAN NOT NULL DEFAULT false,
    "securityRequireStrongPassword" BOOLEAN NOT NULL DEFAULT true,
    "securityEnableTwoFactor" BOOLEAN NOT NULL DEFAULT false,
    "securitySessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettingsAudit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "performedById" TEXT NOT NULL,
    "settingId" TEXT NOT NULL,

    CONSTRAINT "SettingsAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateNote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "CandidateNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateResume" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "storagePath" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,

    CONSTRAINT "CandidateResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateActivity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "action" "CandidateActivityType" NOT NULL,
    "details" TEXT NOT NULL,

    CONSTRAINT "CandidateActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "templateId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "TemplateVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationAudit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notificationId" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "performedById" TEXT NOT NULL,

    CONSTRAINT "NotificationAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SettingsAudit_performedById_idx" ON "SettingsAudit"("performedById");

-- CreateIndex
CREATE INDEX "SettingsAudit_settingId_idx" ON "SettingsAudit"("settingId");

-- CreateIndex
CREATE INDEX "CandidateNote_candidateId_idx" ON "CandidateNote"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateNote_authorId_idx" ON "CandidateNote"("authorId");

-- CreateIndex
CREATE INDEX "CandidateResume_candidateId_idx" ON "CandidateResume"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateResume_uploadedById_idx" ON "CandidateResume"("uploadedById");

-- CreateIndex
CREATE INDEX "CandidateActivity_candidateId_idx" ON "CandidateActivity"("candidateId");

-- CreateIndex
CREATE INDEX "CandidateActivity_userId_idx" ON "CandidateActivity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateCategory_name_key" ON "TemplateCategory"("name");

-- CreateIndex
CREATE INDEX "TemplateVersion_templateId_idx" ON "TemplateVersion"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateVersion_templateId_versionNumber_key" ON "TemplateVersion"("templateId", "versionNumber");

-- CreateIndex
CREATE INDEX "NotificationAudit_notificationId_idx" ON "NotificationAudit"("notificationId");

-- CreateIndex
CREATE INDEX "NotificationAudit_performedById_idx" ON "NotificationAudit"("performedById");

-- CreateIndex
CREATE UNIQUE INDEX "OfferTemplate_latestVersionId_key" ON "OfferTemplate"("latestVersionId");

-- CreateIndex
CREATE INDEX "OfferTemplate_categoryId_idx" ON "OfferTemplate"("categoryId");

-- CreateIndex
CREATE INDEX "OfferTemplate_isActive_isArchived_idx" ON "OfferTemplate"("isActive", "isArchived");

-- AddForeignKey
ALTER TABLE "SettingsAudit" ADD CONSTRAINT "SettingsAudit_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettingsAudit" ADD CONSTRAINT "SettingsAudit_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "AppSetting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateNote" ADD CONSTRAINT "CandidateNote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateResume" ADD CONSTRAINT "CandidateResume_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateResume" ADD CONSTRAINT "CandidateResume_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateActivity" ADD CONSTRAINT "CandidateActivity_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferTemplate" ADD CONSTRAINT "OfferTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TemplateCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferTemplate" ADD CONSTRAINT "OfferTemplate_latestVersionId_fkey" FOREIGN KEY ("latestVersionId") REFERENCES "TemplateVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateVersion" ADD CONSTRAINT "TemplateVersion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "OfferTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateVersion" ADD CONSTRAINT "TemplateVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationAudit" ADD CONSTRAINT "NotificationAudit_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationAudit" ADD CONSTRAINT "NotificationAudit_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
