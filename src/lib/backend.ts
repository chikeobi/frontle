// --- Hello test endpoint ---
export const HELLO_URL =
  "https://us-central1-frontle.cloudfunctions.net/hello";

export async function pingBackend() {
  const res = await fetch(HELLO_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<{
    ok: boolean;
    message: string;
  }>;
}

// --- Analyze Quote endpoint (2nd gen Cloud Run URL) ---
export const ANALYZE_QUOTE_URL =
  "https://analyzequote-lspjvwvnea-uc.a.run.app";

export async function analyzeQuote(quoteText: string) {
  const res = await fetch(ANALYZE_QUOTE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quoteText }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return res.json() as Promise<{
    ok: boolean;
    screwScore: string;
    otd: number;
    received?: string | null;
    topIssues: string[];
  }>;
}