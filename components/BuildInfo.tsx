"use client";

export default function BuildInfo() {
  const buildDate = process.env.NODE_ENV === 'development' 
    ? new Date().toISOString().slice(0, 16).replace('T', ' ')
    : process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().slice(0, 16).replace('T', ' ');
  
  const gitSha = process.env.NODE_ENV === 'development'
    ? 'dev'
    : process.env.NEXT_PUBLIC_GIT_SHA || '62c7b10';

  return (
    <footer className="bg-gray-50 border-t py-4">
      <div className="container">
        <p className="text-xs text-gray-500 text-center">
          Build: {buildDate} + {gitSha}
        </p>
      </div>
    </footer>
  );
}