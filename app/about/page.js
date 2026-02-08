import Link from 'next/link';

export const metadata = {
  title: "About Us - Tech Ascend",
  description: "Learn more about Tech Ascend, the premier computer science society.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <span className="text-5xl">🚀</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Coming Soon
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          We&apos;re working on something amazing! Our About page will be live soon.
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
          >
            ← Back to Home
          </Link>
          <Link 
            href="/events"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
          >
            View Events
          </Link>
        </div>
      </div>
    </div>
  );
}
