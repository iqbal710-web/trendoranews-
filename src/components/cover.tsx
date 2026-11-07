export type CoverInput = {
  coverImage: string | null;
  category: { slug: string } | null;
  type: string;
  title: string;
};

export function coverSrc(article: CoverInput): string {
  if (article.coverImage) return article.coverImage;
  return `/covers/${article.category?.slug ?? article.type ?? "news"}.svg`;
}

export function CoverImage({
  article,
  className = "",
  ratio = "aspect-[16/9]",
}: {
  article: CoverInput;
  className?: string;
  ratio?: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden bg-slate-200 dark:bg-slate-800 ${ratio} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverSrc(article)}
        alt={article.title}
        loading="lazy"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
    </div>
  );
}
