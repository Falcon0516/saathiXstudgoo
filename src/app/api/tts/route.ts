import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for the Sarvam Text-to-Speech API.
 * Keeps the API key secure — never exposed to the client.
 */

const SARVAM_API_KEY = "sk_rurrqm8i_M5TeMWiTrusZTfkC7QXOF0jM";
const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      language_code = "en-IN",
      speaker = "shubh",
      pace = 1.0,
      model = "bulbul:v3",
    } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const response = await fetch(SARVAM_TTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Subscription-Key": SARVAM_API_KEY,
      },
      body: JSON.stringify({
        text,
        language_code,
        speaker,
        pace,
        model,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Sarvam TTS error:", response.status, errText);
      return NextResponse.json(
        { error: "TTS generation failed", details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("TTS route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
