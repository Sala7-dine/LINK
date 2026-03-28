import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <div className="text-8xl font-bold text-primary-500">404</div>
      <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">Page introuvable</p>
      <Link to="/dashboard" className="btn-primary mt-6">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
