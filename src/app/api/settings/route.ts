import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { getSettings, updateSettings } from "@/services/settings-service";
import { settingsUpdateSchema } from "@/validators/settings";
import { notifySettingsUpdated } from "@/services/notification-service";

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth(request, ["ADMIN"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const auth = await requireApiAuth(request, ["ADMIN"]);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();
  const parsed = settingsUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings payload", details: parsed.error.flatten() }, { status: 422 });
  }

  try {
    const settings = await updateSettings(parsed.data, auth.id);
    await notifySettingsUpdated(auth.id);
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update settings." }, { status: 500 });
  }
}
