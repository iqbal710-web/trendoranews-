import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionHeading({ title, href, accent = "#dc2626" }: { title: string; href?: string; accent?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="h-6 w-1.5 rounded-full" style={{ background: accent }} />
      <h2 className="text-xl font-black tracking-tight sm:text-2xl">{title}</h2>
      {href && (
        <Link href={href} className="ml-auto flex items-center gap-1 text-sm font-bold text-red-600 hover:underline">
          View all <ChevronRight size={15} />
        </Link>
      )}
    </div>
  );
}
