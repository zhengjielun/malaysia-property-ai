type PlaceholderPageProps = { eyebrow: string; title: string; description: string };

export default function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return <main className="min-h-screen px-6 py-20 sm:px-10"><div className="mx-auto max-w-5xl"><p className="text-sm font-semibold text-[#315bd4]">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#172033]">{title}</h1><section className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><div className="grid h-12 w-12 place-items-center rounded-xl bg-[#eaf0ff] text-xl text-[#315bd4]">✦</div><h2 className="mt-5 text-lg font-semibold">页面准备中</h2><p className="mt-2 max-w-xl leading-7 text-slate-600">{description}</p></section></div></main>;
}
