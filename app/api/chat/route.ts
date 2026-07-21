import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const systemInstructions = `你是一名真实的马来西亚房地产顾问，而不是AI机器人。

请严格遵守以下规则：

1. 只能根据系统提供的真实数据库房源回答。
2. 不允许编造任何房源资料、价格、面积、学校、交通、设施、投资回报、发展潜力等内容。
3. 数据库没有的信息，请直接说："目前资料中没有提供。"
4. 回复必须像真人通过 WhatsApp 与客户聊天，自然、简洁、专业。
5. 不要使用"尊敬的客户"、"非常荣幸"、"绝佳投资"、"核心地段"、"顶级"等AI营销语言。
6. 不要写成长篇文章，每次回复控制在2~5句话。
7. 如果找到房源，先告诉客户找到几套，再简单介绍房源。
8. 最后只问一个有助于继续筛选的问题。
9. 永远不要假装自己看过房子，也不要承诺任何数据库没有的信息。
10. 如果客户要求预约、联系经纪人或安排看房，再询问客户联系方式。

你的目标是像经验丰富的马来西亚房产顾问，而不是ChatGPT。`;

type ChatMessage = { role: "user" | "assistant"; content: string };
const fallbackModels = ["gemini-3.5-flash", "gemini-3-flash", "gemini-flash-latest"];

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Record<string, unknown>;
  return (message.role === "user" || message.role === "assistant") && typeof message.content === "string" && message.content.trim().length > 0;
}

function getMessages(body: unknown): ChatMessage[] {
  if (typeof body !== "object" || body === null) return [];
  const payload = body as { messages?: unknown; message?: unknown };
  if (Array.isArray(payload.messages)) return payload.messages.filter(isChatMessage).slice(-20);
  if (typeof payload.message === "string" && payload.message.trim()) return [{ role: "user", content: payload.message.trim() }];
  return [];
}

function parseFilters(message: string) {
  const budgetMatch = message.replace(/,/g, "").match(/(?:RM|rm|预算|budget)\s*([0-9]{5,8})/);
  const bedroomsMatch = message.match(/([1-9])\s*(?:房|bed|bedroom)/i);
  const areaMatch = ["Mont Kiara", "KLCC", "Desa ParkCity", "Desa公园城", "Petaling Jaya", "Cheras"].find((area) => message.toLowerCase().includes(area.toLowerCase()));
  const purpose = /投资|investment/i.test(message) ? "投资" : /自住|own stay/i.test(message) ? "自住" : undefined;
  return { budget: budgetMatch ? Number(budgetMatch[1]) : undefined, bedrooms: bedroomsMatch ? Number(bedroomsMatch[1]) : undefined, area: areaMatch, purpose };
}

type DatabaseProperty = { name: string; area: string; price: number; property_type: string | null; bedrooms: number | null; bathrooms: number | null; size_sqft: number | null; status: string | null; purpose: string | null; description: string | null };

async function findProperties(message: string) {
  const filters = parseFilters(message);
  let query = getSupabaseServerClient().from("properties").select("name, area, price, property_type, bedrooms, bathrooms, size_sqft, status, purpose, description").eq("status", "在售");
  if (filters.area) query = query.ilike("area", `%${filters.area}%`);
  if (filters.budget) query = query.lte("price", filters.budget);
  if (filters.bedrooms) query = query.gte("bedrooms", filters.bedrooms);
  if (filters.purpose) query = query.ilike("purpose", `%${filters.purpose}%`);
  const { data, error } = await query.limit(5);
  if (error) throw error;
  return { filters, properties: (data ?? []) as DatabaseProperty[] };
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "聊天服务尚未设置，请在 .env.local 中添加 GEMINI_API_KEY。" }, { status: 503 });
  }

  try {
    const messages = getMessages(await request.json());
    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return NextResponse.json({ error: "请先输入消息以开始聊天。" }, { status: 400 });
    }

    const { filters, properties } = await findProperties(messages[messages.length - 1].content);
    if (process.env.NODE_ENV === "development") {
      console.log("PropertyAI chat filters", filters);
      console.log("PropertyAI database property count", properties.length);
    }
    const databaseContext = properties.length ? properties.map((property, index) => `${index + 1}. 名称：${property.name}；地区：${property.area}；价格：RM ${property.price.toLocaleString("en-MY")}；房型：${property.property_type ?? "未提供"}；${property.bedrooms ?? "未提供"} 房 ${property.bathrooms ?? "未提供"} 卫；面积：${property.size_sqft ?? "未提供"} sqft；状态：${property.status ?? "未提供"}；用途：${property.purpose ?? "未提供"}；说明：${property.description ?? "未提供"}`).join("\n") : "目前数据库里没有找到完全符合条件的在售房源。您是否愿意提高预算、调整地区或减少房间数量？";
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    for (const model of fallbackModels) {
      try {
        const response = await client.models.generateContent({
          model,
          contents,
          config: { systemInstruction: `${systemInstructions}\n\n真实数据库房源：\n${databaseContext}` },
        });
        const reply = response.text?.trim();
        if (reply) {
          if (process.env.NODE_ENV === "development") console.log("PropertyAI Gemini model", model);
          return NextResponse.json({ reply });
        }
      } catch (error) {
        const geminiError = error as { status?: unknown; code?: unknown; details?: unknown };
        console.error("Gemini API error:", {
          model,
          message: error instanceof Error ? error.message : String(error),
          status: geminiError.status,
          code: geminiError.code,
          details: geminiError.details,
          error,
        });
      }
    }

    return NextResponse.json({ error: "Gemini 服务暂时不可用，请稍后重试。" }, { status: 503 });
  } catch (error) {
    const geminiError = error as { status?: unknown; code?: unknown; details?: unknown };
    console.error("Gemini API error:", {
      message: error instanceof Error ? error.message : String(error),
      status: geminiError.status,
      code: geminiError.code,
      details: geminiError.details,
      error,
    });
    return NextResponse.json({ error: "Gemini 服务暂时不可用，请稍后重试。" }, { status: 503 });
  }
}
