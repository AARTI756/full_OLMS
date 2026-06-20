export async function downloadTemplatePdf(templateId: string, options?: { offerId?: string }) {
  const params = new URLSearchParams();
  if (options?.offerId) {
    params.set("offerId", options.offerId);
  }

  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`/api/templates/${templateId}/pdf${query}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const payload = await response.text().catch(() => "");
    throw new Error(payload || "Unable to download PDF.");
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") || "";
  const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
  const filename = filenameMatch?.[1] ?? `template-${templateId}.pdf`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
