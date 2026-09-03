import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for Groq Chat Completions API.
 * Streams responses back to the client for real-time chatbot UX.
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `You are Saathi, an autonomous AI voice agent built for StudGoo — a hyperlocal gig-work marketplace connecting verified students with local businesses within a 5 km radius in Bangalore.

Your capabilities:
- Automated candidate screening and matching
- Privacy-preserving masked call routing
- 24/7 customer support triage
- Real-time GPS-based radius verification

You speak naturally and helpfully. Keep responses concise (2-3 sentences max). You represent Saathi's Proprietary Conversational AI — never mention any specific tech stack, frameworks, or third-party services.

When asked about StudGoo operations, reference these facts:
- 50,000+ verified students on the platform
- 11 job categories (Barista, Event Staff, Retail, Warehouse, Tutor, etc.)
- 5 km hyperlocal matching radius
- "Hire in 24 Hours" promise
- Weekly payouts for students
- 100% Verified Safe Platform`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, stream = false } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: fullMessages,
        stream,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq chat error:", response.status, errText);
      return NextResponse.json(
        { error: "Chat generation failed", details: errText },
        { status: response.status }
      );
    }

    if (stream && response.body) {
      return new NextResponse(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error("Chat route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
