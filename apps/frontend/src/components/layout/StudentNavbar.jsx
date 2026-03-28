import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, logout } from '../../store/slices/authSlice';
import { authService } from '../../services';

const studentNav = [
  { to: '/home', label: 'Home' },
  { to: '/experiences', label: 'Expériences' },
  { to: '/offers', label: 'Offres' },
  { to: '/kanban', label: 'Mes candidatures' },
  { to: '/profile', label: 'Profil' },
];

export default function StudentNavbar() {
  const _user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/home';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[90%] max-w-5xl rounded-full ${
        !isHomePage || scrolled
          ? 'bg-white/90 backdrop-blur-xl border border-zinc-200 shadow-lg shadow-zinc-200/50 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="font-bold text-white text-lg">N</span>
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-800 to-green-600">
            LINK
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
          {studentNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `hover:text-green-700 transition-colors relative group ${isActive ? 'text-green-700' : ''}`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transition-all ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLogout}
            className="group relative px-5 py-2 rounded-full overflow-hidden bg-zinc-900 text-white font-semibold text-sm shadow-lg shadow-zinc-500/30 hover:shadow-xl transition-all"
          >
            <span className="relative z-10">Déconnexion</span>
          </button>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 mx-6 pb-4 bg-white/95 backdrop-blur-xl rounded-2xl border border-zinc-200 shadow-xl p-4 flex flex-col gap-2">
          {studentNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-green-50 text-green-700' : 'text-zinc-600 hover:bg-zinc-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
