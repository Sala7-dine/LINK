import { Outlet, Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import heroImage from '../../assets/images/hero-image.png';

export default function AuthLayout() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">

      {/* ── Left Panel (decorative) ──────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-zinc-950 p-12">

        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-green-500/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px]" />
        </div>

        {/* Logo top-left */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="font-bold text-white text-xl">N</span>
          </div>
          <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
            LINK
          </span>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          {/* Snake-border mini preview */}
          <div className="relative mb-10 max-w-sm">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 via-emerald-500/20 to-teal-500/30 rounded-2xl blur-2xl opacity-60" />
            <div className="relative w-full rounded-2xl overflow-hidden p-[1.5px]">
              <div className="absolute inset-[-50%] bg-[conic-gradient(transparent_270deg,#16a34a_360deg)] animate-spin" style={{ animationDuration: '4s', animationTimingFunction: 'linear' }} />
              <div className="relative bg-zinc-900 rounded-[14px] overflow-hidden">
                <img src={heroImage} alt="Aperçu plateforme LINK" className="w-full h-auto block rounded-[14px] opacity-80" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-snug">
            Un simple lien pour<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              bâtir votre avenir
            </span>
          </h2>
          <p className="text-zinc-400 text-base leading-relaxed max-w-sm">
            Connectez-vous aux meilleures opportunités, suivez votre progression et accédez à un réseau exclusif d'écoles et d'entreprises partenaires.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            {['Offres de stage', 'Suivi des candidatures', 'Réseau alumni', 'Profil étudiant'].map((f) => (
              <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom partners */}
        <div className="relative z-10">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-4">Partenaires</p>
          <div className="flex items-center gap-6 opacity-40">
            {['YouCode', 'Simplon', '1337', 'EMSI', 'OFPPT'].map((name) => (
              <span key={name} className="text-white font-bold text-sm">{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel (form) ───────────────────────────── */}
      <div className="flex-1 flex flex-col">
        {/* Mobile logo top */}
        <div className="lg:hidden flex items-center justify-between p-6 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center">
              <span className="font-bold text-white">N</span>
            </div>
            <span className="font-bold text-zinc-900">LINK</span>
          </div>
          <Link to="/login" className="text-sm text-zinc-500 hover:text-green-600 transition-colors">Connexion</Link>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center">
          <p className="text-xs text-zinc-400">&copy; 2026 LINK · Made with <span className="text-red-400">❤</span> for YouCode</p>
        </div>
      </div>
    </div>
  );
}
