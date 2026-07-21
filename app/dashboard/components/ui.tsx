"use client";

import { ReactNode } from "react";

export function Header({ title = "PropertyAI 后台", action }: { title?: string; action?: ReactNode }) {
  return <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-10"><p className="text-sm font-semibold text-slate-700">{title}</p>{action}</header>;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-4"><div>{eyebrow && <p className="text-sm font-semibold text-[#315bd4]">{eyebrow}</p>}<h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#172033]">{title}</h1>{description && <p className="mt-2 text-slate-600">{description}</p>}</div>{actions && <div className="flex flex-wrap gap-3">{actions}</div>}</div>;
}

export function StatCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><div className="mt-3 flex items-end justify-between gap-3"><strong className="text-3xl font-semibold tracking-tight">{value}</strong>{detail && <span className="text-xs font-semibold text-emerald-600">{detail}</span>}</div></article>;
}

export function SearchBar(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`h-11 min-w-0 rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#315bd4] focus:ring-4 focus:ring-blue-100 ${props.className ?? ""}`} />; }
export function FilterBar({ children }: { children: ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-flow-col md:auto-cols-fr">{children}</div></section>; }
export function StatusBadge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "gray" | "amber" | "violet" }) { const tones = { blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700", gray: "bg-slate-100 text-slate-600", amber: "bg-amber-50 text-amber-700", violet: "bg-violet-50 text-violet-700" }; return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>; }
export function EmptyState({ title = "暂无数据", description }: { title?: string; description?: string }) { return <div className="rounded-xl bg-slate-50 p-8 text-center"><p className="font-medium text-slate-700">{title}</p>{description && <p className="mt-2 text-sm text-slate-500">{description}</p>}</div>; }
export function Loading() { return <div className="grid min-h-40 place-items-center text-sm text-slate-400">正在加载…</div>; }
export function Toast({ message }: { message: string }) { return message ? <div role="status" className="fixed bottom-5 right-5 z-[90] rounded-xl bg-[#172b57] px-4 py-3 text-sm font-semibold text-white shadow-xl">✓ {message}</div> : null; }
export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) { if (!open) return null; return <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/35 p-4"><section role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><button type="button" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-xl text-slate-500 hover:bg-slate-100" aria-label="关闭">×</button></div><div className="mt-5">{children}</div></section></div>; }
export function ConfirmDialog({ open, title, description, onConfirm, onClose }: { open: boolean; title: string; description: string; onConfirm: () => void; onClose: () => void }) { return <Modal open={open} title={title} onClose={onClose}><p className="text-sm leading-6 text-slate-600">{description}</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">取消</button><button type="button" onClick={onConfirm} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white">确认删除</button></div></Modal>; }
