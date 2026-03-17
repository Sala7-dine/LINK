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
  UsersIcon,
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const open = useSelector(selectSidebarOpen);
  const user = useSelector(selectUser);
  const isSchoolAdmin = ['school_admin', 'super_admin'].includes(user?.role);
  const isCompanyAdmin = user?.role === 'company_admin';
  
  let nav = [];
  
  if (isSchoolAdmin) {
    nav = [
      { to: user?.role === 'school_admin' ? '/admin/dashboard' : '/platform/dashboard', label: 'Statistiques', icon: HomeIcon },
      { to: '/profile', label: 'Mon profil', icon: UserCircleIcon },
      { to: '/companies', label: 'Entreprises', icon: BuildingOffice2Icon },
      { to: '/offers', label: 'Offres', icon: BriefcaseIcon },
      { to: '/admin/import-students', label: 'Import étudiants', icon: ArrowUpTrayIcon },
      { to: '/admin/users', label: 'Gestion users', icon: UsersIcon },
    ];
  } else if (isCompanyAdmin) {
    nav = [
      { to: '/company/applications', label: 'Tableau de bord', icon: HomeIcon },
      { to: '/profile', label: 'Mon profil', icon: UserCircleIcon },
      { to: '/companies', label: 'Annuaire Entreprises', icon: BuildingOffice2Icon },
      { to: '/offers', label: 'Offres postées', icon: BriefcaseIcon },
    ];
  } else {
    nav = [
      { to: '/home', label: 'Home', icon: HomeIcon },
      { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
      { to: '/companies', label: 'Entreprises', icon: BuildingOffice2Icon },
      { to: '/offers', label: 'Offres', icon: BriefcaseIcon },
      { to: '/experiences', label: 'Experiences', icon: BriefcaseIcon },
      { to: '/kanban', label: 'Mes candidatures', icon: ViewColumnsIcon },
      { to: '/profile', label: 'Mon profil', icon: UserCircleIcon },
    ];
  }

  return (
    <aside className={`fixed top-0 left-0 h-full bg-white/60 backdrop-blur-2xl border-r border-white/40 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)] z-20 transition-all duration-300 ${open ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center gap-3 h-20 px-5 border-b border-zinc-200/50 bg-white/30">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md flex items-center justify-center text-white font-bold text-xl select-none ring-2 ring-white/50 flex-shrink-0">L</div>
        {open && <span className="font-bold text-2xl tracking-tight text-zinc-900">LINK</span>}
      </div>
      <nav className="mt-6 flex flex-col gap-2 px-3 relative z-10">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group overflow-hidden
              ${isActive
                ? 'bg-white shadow-sm border border-white/80 text-green-600 scale-[1.02] transform'
                : 'text-zinc-500 hover:bg-white/50 hover:text-zinc-900 hover:scale-[1.02] transform border border-transparent'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                
                <div className="relative flex items-center justify-center w-8 h-8 rounded-xl shrink-0">
                   <Icon className={`w-6 h-6 z-10 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : 'group-hover:scale-110'}`} />
                </div>
                
                {open && <span className="relative z-10 whitespace-nowrap">{label}</span>}
                
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-green-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Decorative gradient overlay */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
    </aside>
  );
}
