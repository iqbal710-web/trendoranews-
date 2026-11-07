import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarClock, Clock, Eye, RefreshCw, ShieldCheck, Tag } from "lucide-react";
import { getArticleBySlug, getRelatedArticles, queryArticles, getArticleEngagement } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Reader } from "@/components/reader";
import { Comments } from "@/components/comments";
import { SectionHeading } from "@/components/section-heading";
import { ArticleCardView } from "@/components/article-card";
import { MiniList } from "@/components/mini-list";
import { coverSrc } from "@/components/cover";

export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = await getArticleBySlug(slug);
  if (!found) return { title: "Article not found" };
  const { article, category, author } = found;
  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || article.title,
    alternates: { canonical: `/article/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt ?? article.title,
      publishedTime: article.publishedAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: author ? [author.name] : undefined,
      section: category?.name,
      tags: found.tags.map((t) => t.name),
      images: [article.coverImage || coverSrc({ coverImage: article.coverImage, category, type: article.type, title: article.title })],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getArticleBySlug(slug);
  if (!found) notFound();
  const { article, category, author, tags, sources, commentCount } = found;
  const user = await getCurrentUser();
  const engagement = await getArticleEngagement(article.id, user?.id ?? null);
  const related = await getRelatedArticles(article.id, article.categoryId, 6);
  const moreFromAuthor = author
    ? await queryArticles({ authorId: author.id, sort: "latest", limit: 5 })
    : { cards: [] };
  const alsoLike = await queryArticles({ sort: "trending", limit: 4 });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [article.coverImage || coverSrc({ coverImage: article.coverImage, category, type: article.type, title: article.title })],
    datePublished: article.publishedAt.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: author
      ? { "@type": "Person", name: author.name, url: `${SITE}/author/${author.id}` }
      : { "@type": "Organization", name: "TrendoraNews" },
    publisher: {
      "@type": "Organization",
      name: "TrendoraNews",
      logo: { "@type": "ImageObject", url: `${SITE}/og-image.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/article/${article.slug}` },
    articleSection: category?.name,
    keywords: tags.map((t) => t.name).join(", "),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      ...(category
        ? [{ "@type": "ListItem", position: 2, name: category.name, item: `${SITE}/category/${category.slug}` }]
        : []),
      { "@type": "ListItem", position: category ? 3 : 2, name: article.title, item: `${SITE}/article/${article.slug}` },
    ],
  };

  const FACT_LABEL: Record<string, { label: string; cls: string }> = {
    verified: { label: "Fact-checked: Verified", cls: "bg-green-600" },
    unverified: { label: "Fact-check: Unverified claim", cls: "bg-amber-600" },
    disputed: { label: "Fact-check: Disputed", cls: "bg-red-700" },
    pending: { label: "Fact-check: Pending review", cls: "bg-slate-500" },
  };
  const fact = FACT_LABEL[article.factCheckStatus] ?? FACT_LABEL.pending;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="grid gap-10 lg:grid-cols-3">
        <article className="lg:col-span-2">
          {/* breadcrumb */}
          <nav className="text-xs text-(--muted)">
            <Link href="/" className="hover:underline">Home</Link>
            {category && (
              <>
                {" / "}
                <Link href={`/category/${category.slug}`} className="hover:underline">{category.name}</Link>
              </>
            )}
          </nav>

          {/* headline */}
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 text-lg text-(--muted)">{article.excerpt}</p>

          {/* meta */}
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-(--line) py-3 text-sm">
            {author && (
              <span className="flex items-center gap-2 font-bold">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-red-600 text-xs font-black text-white">
                  {author.name.charAt(0).toUpperCase()}
                </span>
                {author.name}
                {author.verified && <BadgeCheck size={15} className="text-blue-500" />}
              </span>
            )}
            <span className="flex items-center gap-1 text-(--muted)">
              <CalendarClock size={14} /> Published {formatDate(article.publishedAt)}
            </span>
            {article.updatedAt > article.publishedAt && (
              <span className="flex items-center gap-1 text-(--muted)">
                <RefreshCw size={13} /> Updated {formatDate(article.updatedAt)}
              </span>
            )}
            <span className="flex items-center gap-1 text-(--muted)">
              <Clock size={14} /> {article.readingTime} min read
            </span>
            <span className="flex items-center gap-1 text-(--muted)">
              <Eye size={14} /> {article.views} views
            </span>
            {category && (
              <Link
                href={`/category/${category.slug}`}
                className="chip text-white"
                style={{ background: category.color ?? "#dc2626" }}
              >
                {category.name}
              </Link>
            )}
            <span className={`chip text-white ${fact.cls}`}>
              <ShieldCheck size={12} /> {fact.label}
            </span>
            {article.breaking && <span className="chip bg-red-600 text-white">● Breaking</span>}
          </div>

          {/* cover */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverSrc({ coverImage: article.coverImage, category, type: article.type, title: article.title })}
            alt={article.title}
            className="mt-6 w-full rounded-2xl border border-(--line) object-cover"
          />

          {/* interactive reader */}
          <Reader
            article={{
              id: article.id,
              slug: article.slug,
              title: article.title,
              content: article.content,
              likes: article.likes,
              shares: article.shares,
              liked: engagement.liked,
              bookmarked: engagement.bookmarked,
            }}
            sources={sources}
            tags={tags}
            categorySlug={category?.slug ?? null}
            authorId={author?.id ?? null}
          />

          {/* tags */}
          {tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Tag size={15} className="text-(--muted)" />
              {tags.map((t) => (
                <Link key={t.slug} href={`/tag/${t.slug}`} className="chip bg-slate-200 text-slate-700 hover:bg-red-600 hover:text-white dark:bg-slate-800 dark:text-slate-200">
                  #{t.name}
                </Link>
              ))}
            </div>
          )}

          {/* sources */}
          {sources.length > 0 && (
            <div className="card mt-6 p-5">
              <p className="label">Sources & References</p>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {sources.map((s) => (
                  <li key={s.id}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-red-600 hover:underline">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* author box */}
          {author && (
            <div className="card mt-6 flex gap-4 p-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-red-600 text-xl font-black text-white">
                {author.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="flex items-center gap-1 font-black">
                  {author.name}
                  {author.verified && <BadgeCheck size={16} className="text-blue-500" />}
                  <span className="chip ml-1 bg-blue-600 text-white">Verified Author</span>
                </p>
                <p className="mt-1 text-sm text-(--muted)">{author.bio || "Staff correspondent at TrendoraNews."}</p>
              </div>
            </div>
          )}

          {/* comments */}
          <Comments articleId={article.id} initialCount={commentCount} />
        </article>

        {/* sidebar */}
        <aside className="flex flex-col gap-8">
          <section className="card p-5">
            <SectionHeading title="Related Stories" accent="#dc2626" />
            <MiniList items={related} />
          </section>
          {moreFromAuthor.cards.length > 0 && (
            <section className="card p-5">
              <SectionHeading title={`More from ${author?.name ?? "this author"}`} accent="#f59e0b" />
              <MiniList items={moreFromAuthor.cards} />
            </section>
          )}
          <section className="card p-5">
            <SectionHeading title="You May Also Like" accent="#8b5cf6" />
            <div className="flex flex-col gap-4">
              {alsoLike.cards.map((a) => (
                <ArticleCardView key={a.id} a={a} />
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
