'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Captured by GlobalError:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-50 text-gray-900">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 space-y-4 border-l-4 border-red-500">
            <h1 className="text-2xl font-bold text-red-600">Something went wrong!</h1>
            <p className="font-semibold">{error.message}</p>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {error.stack}
            </pre>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-semibold"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
