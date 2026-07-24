import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-app py-24 text-center">
      <div className="mx-auto h-20 w-20 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 grid place-items-center text-white mb-6">
        <Compass className="w-10 h-10" />
      </div>
      <h1 className="font-display font-bold text-4xl">Page not found</h1>
      <p className="mt-2 text-ink-500">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Back to home</Link>
    </div>
  );
}
