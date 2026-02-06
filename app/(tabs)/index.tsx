import * as Clipboard from "expo-clipboard";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { analyzeQuote } from "../../src/lib/backend";

type Result = {
  screwScore: "green" | "yellow" | "red";
  otd: number;
  otdProvided?: boolean;
  topIssues: string[];
};

const COLORS = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  text: "#1F1F1F",
  muted: "#6B6B6B",
  border: "#E6E6E3",
  green: "#1E7F4F",
  yellow: "#C9A100",
  red: "#B3261E",
};

function buildDealerMessage(score: "green" | "yellow" | "red", issues: string[]) {
  if (score === "green") {
    return "The quote looks reasonable. Please confirm this is the final out-the-door price.";
  }

  if (score === "yellow") {
    return `I reviewed the quote and had a few concerns (${issues.join(
      ", "
    )}). Can you clarify or revise the out-the-door price?`;
  }

  return `I reviewed the quote and noticed issues (${issues.join(
    ", "
  )}). Please provide an updated out-the-door price with non-optional fees removed.`;
}

export default function HomeScreen() {
  const [quoteText, setQuoteText] = useState(
    "MSRP 41000, Doc fee 899, Nitrogen 299, Paint protection 1299"
  );
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const barColor = useMemo(() => {
    if (!result) return COLORS.border;
    if (result.screwScore === "green") return COLORS.green;
    if (result.screwScore === "yellow") return COLORS.yellow;
    return COLORS.red;
  }, [result]);

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.h1}>Frontle</Text>
          <Text style={styles.sub}>
            Paste the dealer quote. Get a verdict. Don’t get played.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Quote text</Text>
            <TextInput
              value={quoteText}
              onChangeText={setQuoteText}
              placeholder="Paste quote text here…"
              placeholderTextColor={COLORS.muted}
              multiline
              style={styles.input}
            />

            <Pressable
              style={[styles.btn, loading && styles.btnDisabled]}
              disabled={loading}
              onPress={async () => {
                try {
                  setLoading(true);
                  const data = await analyzeQuote(quoteText);
                  setResult({
                    screwScore: data.screwScore,
                    otd: data.otd,
                    otdProvided: data.otdProvided,
                    topIssues: data.topIssues ?? [],
                  });
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Text style={styles.btnText}>
                {loading ? "Analyzing…" : "Analyze"}
              </Text>
            </Pressable>

            {result && (
              <View style={styles.result}>
                <View style={[styles.bar, { backgroundColor: barColor }]} />
                <View style={styles.resultBody}>
                  <Text style={styles.score}>
                    Verdict: {result.screwScore.toUpperCase()}
                  </Text>

                  <Text style={styles.otd}>
                    {result.otdProvided ? "OTD" : "Estimated OTD"}: ${result.otd}
                  </Text>

                  {result.topIssues.slice(0, 3).map((i, idx) => (
                    <Text key={idx} style={styles.issue}>
                      • {i}
                    </Text>
                  ))}

                  <View style={{ height: 10 }} />

                  <Pressable
                    style={styles.btnAlt}
                    onPress={async () => {
                      const msg = buildDealerMessage(
                        result.screwScore,
                        result.topIssues
                      );
                      await Clipboard.setStringAsync(msg);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    <Text style={styles.btnAltText}>
                      {copied ? "Copied ✓" : "Copy message to dealer"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    paddingTop: 72,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
  h1: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  btn: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.text,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  result: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    overflow: "hidden",
  },
  bar: {
    height: 6,
    width: "100%",
  },
  resultBody: {
    padding: 12,
    gap: 6,
  },
  score: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },
  otd: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
  },
  issue: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
  },
  btnAlt: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnAltText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
});