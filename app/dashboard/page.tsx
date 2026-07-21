import DashboardAppointments from "./dashboard-appointments";
import SystemStatus from "./system-status";
import { PageHeader, StatCard } from "./components/ui";

const stats = [{ label: "今日新线索", value: "24", detail: "较昨日 +12%" }, { label: "高意向客户", value: "8", detail: "本周新增 +3" }, { label: "待跟进对话", value: "16", detail: "等待团队处理" }, { label: "今日预约看房", value: "5", detail: "已确认行程" }];
export default function DashboardPage() { return <main className="min-h-screen px-6 py-10 text-[#172033] sm:px-10"><div className="mx-auto max-w-6xl"><PageHeader eyebrow="欢迎使用 AI 房地产助手" title="房产销售管理平台" description="查看今日业务表现、客户线索与 AI 对话进展。" actions={<a href="/chat" className="rounded-xl bg-[#315bd4] px-4 py-2.5 text-sm font-semibold text-white">打开 AI 聊天</a>}/><SystemStatus /><section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((item) => <StatCard key={item.label} {...item} />)}</section><DashboardAppointments /></div></main>; }
