import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";

// --- Health check ---
export const hello = onRequest((req, res) => {
  logger.info("hello called", { method: req.method });
  res.status(200).json({
    ok: true,
    message: "Frontle backend is live.",
  });
});

export const analyzeQuote = onRequest((req, res) => {
  logger.info("analyzeQuote called");

  const { quoteText } = req.body ?? {};
  const text = (quoteText ?? "").toLowerCase();

  // naive number extraction (v1)
  const numbers = (text.match(/\d+/g) ?? []).map(Number);

  const otdMatch =
    text.match(/otd\s*[:$]?\s*(\d{2,3}(?:,\d{3})+|\d+)/) ||
    text.match(/out\s*the\s*door\s*[:$]?\s*(\d{2,3}(?:,\d{3})+|\d+)/);

  const otd = otdMatch
    ? Number((otdMatch[1] ?? "").replace(/,/g, ""))
    : numbers.reduce((a: number, b: number) => a + b, 0);

  const otdProvided = Boolean(otdMatch);

  let screwScore: "green" | "yellow" | "red" = "green";
  const issues: string[] = [];

  // doc fee detection
  const docFeeMatch = text.match(/doc\s*fee\s*(\d+)/);
  const docFee = docFeeMatch ? Number(docFeeMatch[1]) : 0;

  // addon detection
  const addonKeywords = ["nitrogen", "protection", "etch", "prep", "package"];
  const hasAddons = addonKeywords.some((k) => text.includes(k));

  // scoring rules
  if (docFee >= 800) {
    screwScore = "red";
    issues.push("Doc fee is unusually high");
  } else if (docFee >= 401) {
    screwScore = "yellow";
    issues.push("Doc fee is higher than average");
  }

  if (hasAddons) {
    issues.push("Dealer add-ons detected");
    if (screwScore === "green") screwScore = "yellow";
  }

  if (issues.length >= 2) screwScore = "red";

  res.status(200).json({
    ok: true,
    screwScore,
    otd,
    otdProvided,
    received: quoteText ?? null,
    topIssues: issues.slice(0, 3),
  });
});