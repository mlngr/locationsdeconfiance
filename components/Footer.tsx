export default function Footer() {
  const sha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_COMMIT_SHA;
  if (!sha) return null;
  const shortSha = String(sha).slice(0, 7);
  return (
    <footer className="container py-6 text-center">
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-xs">
        Version: {shortSha}
      </span>
    </footer>
  );
}