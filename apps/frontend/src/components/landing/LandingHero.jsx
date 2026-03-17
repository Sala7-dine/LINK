import { Link } from 'react-router-dom';

export default function LandingHero() {
  return (
    <section id="hero" className="relative pt-36 pb-24 overflow-hidden bg-white">
      <div className="landing-blob landing-blob-a" />
      <div className="landing-blob landing-blob-b" />
      <div className="landing-blob landing-blob-c" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 text-sm font-medium mb-7">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Gestion intelligente des stages et de l'insertion
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-900 leading-tight">
          Un simple lien pour
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
            construire votre avenir pro
          </span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-zinc-600 text-lg">
          LINK connecte etudiants, ecoles et entreprises autour des offres, candidatures et retours d'experience,
          dans une plateforme unique.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/register-school" className="btn-primary">Creer un espace ecole</Link>
          <Link to="/login" className="btn-secondary">Se connecter</Link>
        </div>

        <div className="mt-14 card max-w-5xl mx-auto border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div>
              <p className="text-sm text-zinc-500">Etudiants</p>
              <p className="text-2xl font-bold text-zinc-900">+1200</p>
              <p className="text-sm text-zinc-600">Profils actifs</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Offres</p>
              <p className="text-2xl font-bold text-zinc-900">+450</p>
              <p className="text-sm text-zinc-600">Stages et CDI</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Ecoles partenaires</p>
              <p className="text-2xl font-bold text-zinc-900">+35</p>
              <p className="text-sm text-zinc-600">Suivi multitenant</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
