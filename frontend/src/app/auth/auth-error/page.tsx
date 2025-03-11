import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="mb-6">
          There was a problem with your authentication request. This could be due to an expired link or an invalid token.
        </p>
        <div className="space-y-4">
          <Link 
            href="/login" 
            className="block w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Login
          </Link>
          <Link 
            href="/" 
            className="block w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 