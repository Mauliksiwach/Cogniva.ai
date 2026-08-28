import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-extrabold text-brand-500 mb-2">404</h1>
      <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
      <p className="text-slate-400 text-sm max-w-md mb-6">The page you are looking for does not exist.</p>
      <Link to="/">
        <Button icon={<Home className="w-4 h-4" />}>Back to Home</Button>
      </Link>
    </div>
  );
};
