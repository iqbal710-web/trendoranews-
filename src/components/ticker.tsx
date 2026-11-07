import Link from "next/link";

export function Ticker({ items }: { items: { slug: string; title: string }[] }) {
  if (!items.length) return null;
  const doubled = [...items, ...items];
  return (
    <div className="flex items-stretch overflow-hidden border-b border-(--line) bg-red-700 text-white">
      <span className="z-10 flex shrink-0 items-center gap-1 bg-red-800 px-3 py-1.5 text-xs font-black uppercase tracking-wider">
        <span className="live-dot inline-block h-2 w-2 rounded-full bg-white" />
        Breaking
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="ticker-track items-center py-1.5 text-sm">
          {doubled.map((it, i) => (
            <Link
              key={`${it.slug}-${i}`}
              href={`/breaking/${it.slug}`}
              className="mx-6 inline-flex items-center gap-2 hover:underline"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-300" />
              {it.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
