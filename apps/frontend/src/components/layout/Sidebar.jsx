import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectSidebarOpen } from '../../store/slices/uiSlice';
import { selectUser } from '../../store/slices/authSlice';
import {
  HomeIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  ViewColumnsIcon,
  UserCircleIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

const baseNav = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/companies', label: 'Entreprises', icon: BuildingOffice2Icon },
  { to: '/offers', label: 'Offres', icon: BriefcaseIcon },
  { to: '/kanban', label: 'Mes candidatures', icon: ViewColumnsIcon },
  { to: '/profile', label: 'Mon profil', icon: UserCircleIcon },
];

export default function Sidebar() {
  const open = useSelector(selectSidebarOpen);
  const user = useSelector(selectUser);
  const isSchoolAdmin = ['school_admin', 'super_admin'].includes(user?.role);
  const nav = isSchoolAdmin
    ? [...baseNav, { to: '/admin/import-students', label: 'Import etudiants', icon: ArrowUpTrayIcon }]
    : baseNav;

  return (
    <aside className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 z-20 transition-all duration-300 ${open ? 'w-64' : 'w-16'}`}>
      <div className="flex items-center gap-3 h-16 px-4 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-lg select-none">L</div>
        {open && <span className="font-bold text-lg text-primary-500">LINK</span>}
      </div>
      <nav className="mt-4 flex flex-col gap-1 px-2">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {open && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
