import { NextResponse } from "next/server";

export const runtime = "nodejs";

type WhatsAppMessage = {
  from?: string;
  id?: string;
  type?: string;
  text?: { body?: string };
};

type WhatsAppWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: { messages?: WhatsAppMessage[] };
    }>;
  }>;
};

function getWhatsAppConfig() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!accessToken || !phoneNumberId || !verifyToken) {
    throw new Error(
      "WhatsApp Cloud API 尚未设置。请检查 WHATSAPP_ACCESS_TOKEN、WHATSAPP_PHONE_NUMBER_ID 和 WHATSAPP_VERIFY_TOKEN。",
    );
  }

  return { accessToken, phoneNumberId, verifyToken };
}

async function getAiReply(request: Request, message: string) {
  const chatUrl = new URL("/api/chat", request.url);
  const response = await fetch(chatUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
    cache: "no-store",
  });

  const payload = (await response.json()) as { reply?: unknown; error?: unknown };
  if (!response.ok || typeof payload.reply !== "string" || !payload.reply.trim()) {
    throw new Error(
      typeof payload.error === "string" ? payload.error : "Gemini 未返回可用回复。",
    );
  }

  return payload.reply.trim();
}

async function sendWhatsAppText(to: string, text: string) {
  const { accessToken, phoneNumberId } = getWhatsAppConfig();
  const response = await fetch(`https://graph.facebook.com/v22.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`WhatsApp Cloud API 发送失败（${response.status}）：${details}`);
  }
}

export async function GET(request: Request) {
  try {
    const { verifyToken } = getWhatsAppConfig();
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === verifyToken && challenge) {
      console.log("WhatsApp webhook verification succeeded.");
      return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    console.warn("WhatsApp webhook verification failed.");
    return NextResponse.json({ error: "Webhook verification failed." }, { status: 403 });
  } catch (error) {
    console.error("WhatsApp webhook verification error:", error);
    return NextResponse.json({ error: "WhatsApp webhook is not configured." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    getWhatsAppConfig();
    const payload = (await request.json()) as WhatsAppWebhookPayload;
    const messages = payload.entry?.flatMap((entry) =>
      entry.changes?.flatMap((change) => change.value?.messages ?? []) ?? [],
    ) ?? [];

    if (!messages.length) {
      return NextResponse.json({ received: true });
    }

    await Promise.all(messages.map(async (message) => {
      const sender = message.from?.trim();
      const text = message.type === "text" ? message.text?.body?.trim() : undefined;

      if (!sender || !text) {
        console.log("Ignoring unsupported WhatsApp message.", { id: message.id, type: message.type });
        return;
      }

      console.log("Received WhatsApp message.", { id: message.id, from: sender });
      const reply = await getAiReply(request, text);
      await sendWhatsAppText(sender, reply);
      console.log("Sent WhatsApp AI reply.", { id: message.id, to: sender });
    }));

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("WhatsApp webhook processing error:", error);
    return NextResponse.json({ error: "Unable to process WhatsApp webhook." }, { status: 500 });
  }
}
