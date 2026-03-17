import { Link } from 'react-router-dom';

export default function LandingNavbar() {
  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-6xl rounded-full border border-emerald-100 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="px-6 py-3 flex items-center justify-between">
        <a href="#hero" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500 flex items-center justify-center text-white font-bold">L</div>
          <span className="font-bold text-lg text-emerald-800 tracking-tight">LINK</span>
        </a>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600">
          <a href="#features" className="hover:text-emerald-700 transition-colors">Fonctionnalites</a>
          <a href="#offers" className="hover:text-emerald-700 transition-colors">Opportunites</a>
          <a href="#community" className="hover:text-emerald-700 transition-colors">Communaute</a>
          <a href="#contact" className="hover:text-emerald-700 transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-zinc-700 hover:text-emerald-700">Connexion</Link>
          <Link to="/register-school" className="btn-primary text-sm">Commencer</Link>
        </div>
      </div>
    </nav>
  );
}
