import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type PropertyPayload = { name: string; area: string; price: number; property_type?: string; bedrooms?: number; bathrooms?: number; size_sqft?: number; status?: string; purpose?: string; description?: string };

function isPayload(value: unknown): value is PropertyPayload { if (typeof value !== "object" || value === null) return false; const item = value as Record<string, unknown>; return typeof item.name === "string" && typeof item.area === "string" && typeof item.price === "number"; }
function errorResponse(error: unknown) { console.error("Properties API error", error); return NextResponse.json({ error: "房源服务暂时不可用，请稍后重试。" }, { status: 500 }); }

export async function GET() { try { const { data, error } = await getSupabaseServerClient().from("properties").select("*").order("created_at", { ascending: false }); if (error) throw error; return NextResponse.json({ properties: data ?? [] }); } catch (error) { return errorResponse(error); } }
export async function POST(request: Request) { try { const body: unknown = await request.json(); if (!isPayload(body)) return NextResponse.json({ error: "房源资料不完整。" }, { status: 400 }); const { data, error } = await getSupabaseServerClient().from("properties").insert(body).select().single(); if (error) throw error; return NextResponse.json({ property: data }, { status: 201 }); } catch (error) { return errorResponse(error); } }
export async function PATCH(request: Request) { try { const body = await request.json() as PropertyPayload & { id?: string }; if (!body.id || !isPayload(body)) return NextResponse.json({ error: "房源资料不完整。" }, { status: 400 }); const { id, ...update } = body; const { data, error } = await getSupabaseServerClient().from("properties").update(update).eq("id", id).select().single(); if (error) throw error; return NextResponse.json({ property: data }); } catch (error) { return errorResponse(error); } }
export async function DELETE(request: Request) { try { const { id } = await request.json() as { id?: string }; if (!id) return NextResponse.json({ error: "缺少房源编号。" }, { status: 400 }); const { error } = await getSupabaseServerClient().from("properties").delete().eq("id", id); if (error) throw error; return NextResponse.json({ ok: true }); } catch (error) { return errorResponse(error); } }
