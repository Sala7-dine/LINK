import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

export default function AuthLayout() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-500 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="text-6xl font-bold mb-4">LINK</div>
          <p className="text-xl text-primary-100 font-light">
            La plateforme collaborative qui transforme votre recherche de stage en une démarche informée et sereine.
          </p>
        </div>
      </div>
      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
