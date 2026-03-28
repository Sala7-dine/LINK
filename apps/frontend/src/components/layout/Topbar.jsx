import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar, toggleDarkMode, selectDarkMode } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { selectUser } from '../../store/slices/authSlice';
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { authService } from '../../services';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const darkMode = useSelector(selectDarkMode);
  const user = useSelector(selectUser);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // server-side logout errors are non-critical; proceed with local logout
    }
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleDarkMode())}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          {darkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>
        {user && (
          <div className="flex items-center gap-2">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium">
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              {user.name}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
