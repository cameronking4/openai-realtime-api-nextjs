import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          We couldn't find the page you were looking for. It might have been removed, renamed, or doesn't exist.
        </p>
        <div className="flex justify-center">
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded inline-block">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 