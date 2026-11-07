import Link from "next/link";
import type { Metadata } from "next";
import { BarChart3, BookOpenText, Globe2, History, Landmark, PawPrint, Rocket, ShieldCheck, Map } from "lucide-react";

export const metadata: Metadata = {
  title: "Interactive Explorers",
  description: "Interactive world map, historical timeline, country explorer, animal encyclopedia, space explorer, data visualization, fact-check center and explainer center.",
};

const EXPLORERS = [
  { href: "/explore/map", icon: Map, title: "Interactive World Map", desc: "Click any country marker to read its latest news.", color: "#2563eb" },
  { href: "/explore/timeline", icon: History, title: "Historical Timeline", desc: "Journey through the defining events of human history.", color: "#b45309" },
  { href: "/explore/countries", icon: Landmark, title: "Country Explorer", desc: "Capitals, currencies, populations and facts for 195+ countries.", color: "#0d9488" },
  { href: "/explore/animals", icon: PawPrint, title: "Animal Encyclopedia", desc: "Wildlife, pets and marine life — species profiles and facts.", color: "#16a34a" },
  { href: "/explore/space", icon: Rocket, title: "Space Explorer", desc: "Planets, stars, galaxies and missions of our universe.", color: "#7c3aed" },
  { href: "/explore/data", icon: BarChart3, title: "Data Visualization", desc: "Live charts of traffic, trending topics and engagement.", color: "#dc2626" },
  { href: "/explore/fact-check", icon: ShieldCheck, title: "Fact Check Center", desc: "Verify viral claims — verdicts from our fact-check desk.", color: "#059669" },
  { href: "/explore/explainers", icon: BookOpenText, title: "Explainer Center", desc: "Complex topics explained simply.", color: "#ea580c" },
];

export default function ExploreHub() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black tracking-tight">🧭 Interactive Explorers</h1>
      <p className="mt-2 max-w-2xl text-(--muted)">
        TrendoraNews goes beyond headlines — explore the world, history, animals, geography and space interactively.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {EXPLORERS.map((e) => (
          <Link key={e.href} href={e.href} className="card group p-6">
            <span className="grid h-12 w-12 place-items-center rounded-2xl text-white" style={{ background: e.color }}>
              <e.icon size={22} />
            </span>
            <h2 className="mt-4 text-lg font-black group-hover:text-red-600">{e.title}</h2>
            <p className="mt-1 text-sm text-(--muted)">{e.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
