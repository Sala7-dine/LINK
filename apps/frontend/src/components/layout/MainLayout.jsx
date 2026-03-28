import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import StudentNavbar from './StudentNavbar';
import { useSelector } from 'react-redux';
import { selectSidebarOpen } from '../../store/slices/uiSlice';
import { selectUser } from '../../store/slices/authSlice';

export default function MainLayout() {
  const sidebarOpen = useSelector(selectSidebarOpen);
  const user = useSelector(selectUser);
  const location = useLocation();
  const isStudent = user?.role === 'student';
  const isHomePage = location.pathname === '/home';

  if (isStudent) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <StudentNavbar />
        {isHomePage ? (
          /* HomePage manages its own layout (full-width, hero padding) */
          <main>
            <Outlet />
          </main>
        ) : (
          /* Inner pages: clear the fixed navbar + comfortable padding */
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
            <Outlet />
          </main>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}
      >
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
