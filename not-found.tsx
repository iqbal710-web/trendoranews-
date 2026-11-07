import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center">
      <p className="text-7xl font-black text-red-600">404</p>
      <h1 className="mt-4 text-2xl font-black">This page isn't in the news… yet</h1>
      <p className="mt-2 text-sm text-(--muted)">The story you're looking for doesn't exist or was archived.</p>
      <Link href="/" className="btn btn-primary mt-6">← Back to the front page</Link>
    </main>
  );
}
