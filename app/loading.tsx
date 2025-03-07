export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 max-w-md w-full flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-300 font-medium">
          Loading...
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Please wait while we prepare your content.
        </p>
      </div>
    </div>
  );
} 