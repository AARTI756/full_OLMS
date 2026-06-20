import { prisma } from "@/prisma/client";
import { decryptValue, encryptValue } from "@/lib/crypto";
import type { SettingsResponse, SettingsUpdateInput } from "@/types/settings";
import type { Prisma } from "@prisma/client";

const DEFAULT_SETTING_VALUES = {
  companyName: "",
  companyWebsite: null,
  companyEmail: null,
  companyPhone: null,
  companyAddress: null,
  brandingLogoUrl: null,
  brandingPrimaryColor: "#0f172a",
  brandingSecondaryColor: "#0284c7",
  smtpHost: null,
  smtpPort: null,
  smtpUser: null,
  smtpFromName: null,
  smtpFromEmail: null,
  smtpSecure: true,
  smtpPasswordEncrypted: null,
  notificationOfferEmail: true,
  notificationCandidateEmail: true,
  notificationSystemAlerts: true,
  notificationDigestFrequency: "daily",
  offerApprovalRequired: true,
  offerAutoRelease: false,
  automationEmailReminders: true,
  automationExpiryThresholdDays: 3,
  automationApprovalReminderHours: 24,
  automationStaleCandidateDays: 14,
  automationCleanupDays: 90,
  securityRequireStrongPassword: true,
  securityEnableTwoFactor: false,
  securitySessionTimeoutMinutes: 60,
};

function mapAppSettingToResponse(setting: any): SettingsResponse {
  return {
    id: setting.id,
    companyName: setting.companyName,
    companyWebsite: setting.companyWebsite,
    companyEmail: setting.companyEmail,
    companyPhone: setting.companyPhone,
    companyAddress: setting.companyAddress,
    brandingLogoUrl: setting.brandingLogoUrl,
    brandingPrimaryColor: setting.brandingPrimaryColor,
    brandingSecondaryColor: setting.brandingSecondaryColor,
    smtpHost: setting.smtpHost,
    smtpPort: setting.smtpPort,
    smtpUser: setting.smtpUser,
    smtpFromName: setting.smtpFromName,
    smtpFromEmail: setting.smtpFromEmail,
    smtpSecure: setting.smtpSecure,
    smtpPasswordConfigured: Boolean(setting.smtpPasswordEncrypted),
    notificationOfferEmail: setting.notificationOfferEmail,
    notificationCandidateEmail: setting.notificationCandidateEmail,
    notificationSystemAlerts: setting.notificationSystemAlerts,
    notificationDigestFrequency: setting.notificationDigestFrequency,
    offerApprovalRequired: setting.offerApprovalRequired,
    offerAutoRelease: setting.offerAutoRelease,
    automationEmailReminders: setting.automationEmailReminders,
    automationExpiryThresholdDays: setting.automationExpiryThresholdDays,
    automationApprovalReminderHours: setting.automationApprovalReminderHours,
    automationStaleCandidateDays: setting.automationStaleCandidateDays,
    automationCleanupDays: setting.automationCleanupDays,
    securityRequireStrongPassword: setting.securityRequireStrongPassword,
    securityEnableTwoFactor: setting.securityEnableTwoFactor,
    securitySessionTimeoutMinutes: setting.securitySessionTimeoutMinutes,
  };
}

function buildChangeDetails(existing: any, updates: SettingsUpdateInput) {
  const details: Record<string, { before: unknown; after: unknown }> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (key === "smtpPassword") {
      if (value !== undefined) {
        details.smtpPassword = {
          before: existing.smtpPasswordEncrypted ? "configured" : "not configured",
          after: value ? "updated" : "cleared",
        };
      }
      continue;
    }

    if (value === undefined) {
      continue;
    }

    const existingValue = (existing as any)[key];
    if (existingValue !== value) {
      details[key] = { before: existingValue ?? null, after: value ?? null };
    }
  }

  return details;
}

async function getOrCreateSettingsRow() {
  const existing = await prisma.appSetting.findFirst();
  if (existing) {
    return existing;
  }

  return prisma.appSetting.create({ data: DEFAULT_SETTING_VALUES });
}

export async function getSettings(): Promise<SettingsResponse> {
  const setting = await getOrCreateSettingsRow();
  return mapAppSettingToResponse(setting);
}

export async function updateSettings(settings: SettingsUpdateInput, updatedById: string): Promise<SettingsResponse> {
  const existing = await getOrCreateSettingsRow();

  const data: any = {
    companyName: settings.companyName ?? existing.companyName,
    companyWebsite: settings.companyWebsite ?? existing.companyWebsite,
    companyEmail: settings.companyEmail ?? existing.companyEmail,
    companyPhone: settings.companyPhone ?? existing.companyPhone,
    companyAddress: settings.companyAddress ?? existing.companyAddress,
    brandingLogoUrl: settings.brandingLogoUrl ?? existing.brandingLogoUrl,
    brandingPrimaryColor: settings.brandingPrimaryColor ?? existing.brandingPrimaryColor,
    brandingSecondaryColor: settings.brandingSecondaryColor ?? existing.brandingSecondaryColor,
    smtpHost: settings.smtpHost ?? existing.smtpHost,
    smtpPort: settings.smtpPort ?? existing.smtpPort,
    smtpUser: settings.smtpUser ?? existing.smtpUser,
    smtpFromName: settings.smtpFromName ?? existing.smtpFromName,
    smtpFromEmail: settings.smtpFromEmail ?? existing.smtpFromEmail,
    smtpSecure: settings.smtpSecure ?? existing.smtpSecure,
    notificationOfferEmail: settings.notificationOfferEmail ?? existing.notificationOfferEmail,
    notificationCandidateEmail: settings.notificationCandidateEmail ?? existing.notificationCandidateEmail,
    notificationSystemAlerts: settings.notificationSystemAlerts ?? existing.notificationSystemAlerts,
    notificationDigestFrequency: settings.notificationDigestFrequency ?? existing.notificationDigestFrequency,
    offerApprovalRequired: settings.offerApprovalRequired ?? existing.offerApprovalRequired,
    offerAutoRelease: settings.offerAutoRelease ?? existing.offerAutoRelease,
    automationEmailReminders: settings.automationEmailReminders ?? existing.automationEmailReminders,
    automationExpiryThresholdDays: settings.automationExpiryThresholdDays ?? existing.automationExpiryThresholdDays,
    automationApprovalReminderHours: settings.automationApprovalReminderHours ?? existing.automationApprovalReminderHours,
    automationStaleCandidateDays: settings.automationStaleCandidateDays ?? existing.automationStaleCandidateDays,
    automationCleanupDays: settings.automationCleanupDays ?? existing.automationCleanupDays,
    securityRequireStrongPassword: settings.securityRequireStrongPassword ?? existing.securityRequireStrongPassword,
    securityEnableTwoFactor: settings.securityEnableTwoFactor ?? existing.securityEnableTwoFactor,
    securitySessionTimeoutMinutes: settings.securitySessionTimeoutMinutes ?? existing.securitySessionTimeoutMinutes,
  };

  if (settings.smtpPassword !== undefined) {
    data.smtpPasswordEncrypted = settings.smtpPassword ? encryptValue(settings.smtpPassword) : null;
  } else {
    data.smtpPasswordEncrypted = existing.smtpPasswordEncrypted;
  }

  const changes = buildChangeDetails(existing, settings);

  const updated = await prisma.appSetting.update({
    where: { id: existing.id },
    data,
  });

  await prisma.settingsAudit.create({
    data: {
      action: "UPDATE_SETTINGS",
      details: Object.keys(changes).length ? (changes as Prisma.InputJsonValue) : ({ note: "Settings updated without tracked changes" } as Prisma.InputJsonValue),
      performedById: updatedById,
      settingId: existing.id,
    },
  });

  return mapAppSettingToResponse(updated);
}
