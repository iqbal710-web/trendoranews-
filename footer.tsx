import Link from "next/link";
import { Zap } from "lucide-react";
import { getAllCategories } from "@/lib/data";
import { NewsletterForm } from "@/components/newsletter-form";

export const dynamic = "force-dynamic";

export async function Footer() {
  const cats = (await getAllCategories()).filter((c) => !c.parentId);
  return (
    <footer className="mt-16 border-t border-(--line) bg-(--surface)">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-600 text-white">
              <Zap size={18} fill="currentColor" />
            </span>
            <span className="text-xl font-black tracking-tight">
              Trendora<span className="text-red-600">News</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-(--muted)">
            Independent digital newspaper covering Bangladesh, the world, business, tech, science,
            history, animals, geography and more — with live breaking coverage and fact checks.
          </p>
          <div className="mt-4">
            <p className="label">Daily newsletter</p>
            <NewsletterForm />
          </div>
        </div>
        <div>
          <p className="label">Sections</p>
          <ul className="space-y-1.5 text-sm">
            {cats.slice(0, 10).map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`} className="hover:text-red-600 hover:underline">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="label">Explore</p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/explore/map" className="hover:text-red-600 hover:underline">Interactive World Map</Link></li>
            <li><Link href="/explore/timeline" className="hover:text-red-600 hover:underline">Historical Timeline</Link></li>
            <li><Link href="/explore/countries" className="hover:text-red-600 hover:underline">Country Explorer</Link></li>
            <li><Link href="/explore/animals" className="hover:text-red-600 hover:underline">Animal Encyclopedia</Link></li>
            <li><Link href="/explore/space" className="hover:text-red-600 hover:underline">Space Explorer</Link></li>
            <li><Link href="/explore/fact-check" className="hover:text-red-600 hover:underline">Fact Check Center</Link></li>
            <li><Link href="/explore/explainers" className="hover:text-red-600 hover:underline">Explainer Center</Link></li>
            <li><Link href="/videos" className="hover:text-red-600 hover:underline">Video News</Link></li>
            <li><Link href="/gallery" className="hover:text-red-600 hover:underline">Photo Gallery</Link></li>
          </ul>
        </div>
        <div>
          <p className="label">Company</p>
          <ul className="space-y-1.5 text-sm">
            <li><Link href="/search" className="hover:text-red-600 hover:underline">Advanced Search</Link></li>
            <li><Link href="/breaking" className="hover:text-red-600 hover:underline">Live / Breaking</Link></li>
            <li><Link href="/rss.xml" className="hover:text-red-600 hover:underline">RSS Feed</Link></li>
            <li><Link href="/sitemap.xml" className="hover:text-red-600 hover:underline">Sitemap</Link></li>
            <li><Link href="/auth/login" className="hover:text-red-600 hover:underline">Sign in</Link></li>
            <li><Link href="/dashboard" className="hover:text-red-600 hover:underline">Newsroom Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-(--line) py-4 text-center text-xs text-(--muted)">
        © {new Date().getFullYear()} TrendoraNews. All rights reserved. ·{" "}
        <Link href="/robots.txt" className="hover:underline">robots.txt</Link>
      </div>
    </footer>
  );
}
