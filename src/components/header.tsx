import Link from "next/link";
import { Zap } from "lucide-react";
import { getAllCategories, getBreakingActive } from "@/lib/data";
import { MegaNav } from "@/components/mega-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchBox } from "@/components/search-box";
import { Ticker } from "@/components/ticker";
import { BreakingBanner } from "@/components/breaking-banner";
import { UserMenu } from "@/components/user-menu";
import { NotificationBell } from "@/components/notification-bell";

export const dynamic = "force-dynamic";

export async function Header() {
  const cats = await getAllCategories();
  const breaking = await getBreakingActive();
  const topLevel = cats.filter((c) => !c.parentId);
  const tickerItems = breaking.slice(0, 8).map((b) => ({ slug: b.slug, title: b.title }));

  return (
    <header className="sticky top-0 z-50">
      {/* Breaking banner */}
      {breaking.length > 0 && <BreakingBanner item={breaking[0]} />}

      {/* Top bar */}
      <div className="border-b border-(--line) bg-(--surface)">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-600 text-white">
              <Zap size={18} fill="currentColor" />
            </span>
            <span className="text-xl font-black tracking-tight">
              Trendora<span className="text-red-600">News</span>
            </span>
          </Link>

          <div className="ml-2 hidden flex-1 md:block">
            <SearchBox />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/breaking"
              className="btn !border-red-600 !bg-red-600 !text-white hover:!bg-red-700"
            >
              <span className="live-dot inline-block h-2 w-2 rounded-full bg-white" />
              LIVE
            </Link>
            <NotificationBell />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Mega navigation */}
      <MegaNav categories={topLevel} allCategories={cats} />

      {/* Breaking ticker */}
      <Ticker items={tickerItems} />
    </header>
  );
}
