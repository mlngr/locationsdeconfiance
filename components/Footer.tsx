export default function Footer() {
  const sha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_COMMIT_SHA;
  if (!sha) return null;
  const shortSha = String(sha).slice(0, 7);
  return (
    <footer className="border-t bg-gray-50 py-4 mt-auto">
      <div className="container text-center text-sm text-gray-600">
        Build: {shortSha}
      </div>
    </footer>
  );
}