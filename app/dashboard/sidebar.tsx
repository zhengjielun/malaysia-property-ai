"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { href: "/dashboard", label: "仪表盘", icon: "▦" },
  { href: "/dashboard/leads", label: "客户线索", icon: "◎" },
  { href: "/dashboard/properties", label: "房源管理", icon: "⌂" },
  { href: "/dashboard/chats", label: "对话记录", icon: "◌" },
  { href: "/dashboard/knowledge", label: "知识库", icon: "▤" },
  { href: "/dashboard/settings", label: "系统设置", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="fixed left-4 top-4 z-40 grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-lg text-slate-700 shadow-sm lg:hidden" aria-label="打开导航菜单">☰</button>
      {isOpen && <button type="button" onClick={() => setIsOpen(false)} aria-label="关闭导航菜单" className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-200 lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2"><Link href="/dashboard" className="text-lg font-semibold tracking-tight">Property<span className="text-[#4168d9]">AI</span></Link><button type="button" onClick={() => setIsOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="关闭导航菜单">×</button></div>
        <p className="mt-8 px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">工作台</p>
        <nav className="mt-3 space-y-1">{menuItems.map((item) => { const active = pathname === item.href; return <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-[#eaf0ff] text-[#315bd4]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}><span className="grid h-5 w-5 place-items-center text-base">{item.icon}</span>{item.label}</Link> })}</nav>
        <div className="mt-auto rounded-2xl bg-[#f4f7ff] p-4"><p className="text-sm font-semibold text-[#233c83]">需要协助？</p><p className="mt-1 text-xs leading-5 text-slate-500">随时使用 AI 助理处理客户咨询。</p><Link href="/chat" className="mt-3 flex justify-center rounded-lg bg-[#315bd4] px-3 py-2 text-xs font-semibold text-white">打开 AI 聊天</Link></div>
      </aside>
    </>
  );
}
