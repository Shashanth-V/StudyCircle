import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</h1>
        <p className="text-xl text-gray-900 dark:text-white font-semibold mb-2">Page not found</p>
        <p className="text-gray-600 dark:text-gray-400 mb-8">The page you are looking for does not exist.</p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back 
          </button>
        </div>
      </div>
    </div>
  );
}
