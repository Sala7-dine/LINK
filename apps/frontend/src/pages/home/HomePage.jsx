import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { offerService } from '../../services';
import heroImage from '../../assets/images/hero-image.png';

/* ─── Scroll Reveal Hook ─────────────────────────────────── */
function useRevealOnScroll() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    const els = document.querySelectorAll('.reveal-on-scroll');
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ─── Star Rating ─────────────────────────────────────────── */
function Stars({ count = 5 }) {
  return (
    <div className="flex gap-1 text-amber-400 mb-4">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ─── Offer Card ──────────────────────────────────────────── */
const BADGE_COLORS = {
  'Stage PFE': 'bg-[#4ADE80]',
  Stage: 'bg-[#FBBF24]',
  CDI: 'bg-[#60A5FA]',
  Remote: 'bg-[#A78BFA]',
  default: 'bg-emerald-500',
};

function OfferCard({ offer, delay = 0 }) {
  const type = offer.type || 'Stage';
  const badgeColor = BADGE_COLORS[type] || BADGE_COLORS.default;
  const tech = Array.isArray(offer.technologies) ? offer.technologies : [];

  return (
    <div
      className="bg-white p-8 rounded-xl border border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col h-full reveal-on-scroll"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-center mb-6">
        <span className={`${badgeColor} text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
          {type}
        </span>
        <span className="text-zinc-800 font-bold text-sm">{offer.salary ? 'Rémunéré' : 'Gratification'}</span>
      </div>

      <h3 className="text-xl font-bold text-zinc-900 mb-2">{offer.title}</h3>
      <div className="text-blue-500 text-xs font-semibold uppercase tracking-wide mb-6 flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        {offer.companyName || 'Entreprise'}
      </div>

      <div className="flex justify-center flex-wrap gap-2 mb-6">
        {tech.slice(0, 2).map((t) => (
          <span key={t} className="px-4 py-1.5 rounded-full border border-zinc-200 text-zinc-600 text-xs font-semibold">{t}</span>
        ))}
        {tech.length > 2 && (
          <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-200">
            +{tech.length - 2}
          </span>
        )}
      </div>

      <p className="text-zinc-400 text-sm leading-relaxed mb-6 line-clamp-2">{offer.description || 'Découvrez cette opportunité.'}</p>
      <div className="w-12 h-0.5 bg-zinc-100 mx-auto mb-6" />

      <Link
        to={`/offers/${offer._id}`}
        className="mt-auto text-zinc-900 text-xs font-bold tracking-widest uppercase hover:text-green-600 transition-colors"
      >
        VOIR L'OFFRE
      </Link>
    </div>
  );
}

/* ─── Static fallback offer cards ───────────────────────────── */
const STATIC_OFFERS = [
  { _id: 's1', type: 'Stage PFE', title: 'Fullstack Dev', companyName: 'Capgemini', technologies: ['React', 'Node'], description: "Rejoignez notre équipe agile pour développer des solutions bancaires innovantes." },
  { _id: 's2', type: 'Stage', title: 'DevOps Junior', companyName: 'Orange', technologies: ['Docker', 'AWS'], description: "Automatisation des déploiements et gestion de l'infrastructure cloud." },
  { _id: 's3', type: 'CDI', title: 'Frontend Lead', companyName: 'Société Générale', technologies: ['Vue', 'TS'], description: "Lead technique pour la refonte de l'application mobile grand public." },
  { _id: 's4', type: 'Remote', title: 'Mobile Flutter', companyName: 'Deloitte', technologies: ['Dart', 'iOS'], description: "Conception d'apps multi-plateformes pour des clients internationaux." },
];

/* ═══════════════════════════════════════════════════════════ */
export default function HomePage() {
  useRevealOnScroll();

  const { data: offersData, isLoading } = useQuery({
    queryKey: ['home-offers'],
    queryFn: () => offerService.getAll({ limit: 4 }).then((r) => r.data.data.offers),
  });

  const offers = useMemo(() => {
    const live = offersData || [];
    return live.length > 0 ? live.slice(0, 4) : STATIC_OFFERS;
  }, [offersData]);

  return (
    <div className="space-y-0">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <main className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-white selection:bg-green-500/30 selection:text-green-800">
        {/* Background Ambience */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gray-200/60 rounded-full blur-[120px] mix-blend-multiply animate-[landingBlob_10s_ease-in-out_infinite]" />
          <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-zinc-400/60 rounded-full blur-[100px] mix-blend-multiply animate-[landingBlob_10s_ease-in-out_infinite_2s]" />
          <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-slate-200/60 rounded-full blur-[120px] mix-blend-multiply animate-[landingBlob_10s_ease-in-out_infinite_4s]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Pill Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-sm shadow-sm mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-sm font-medium text-zinc-600">Gérez vos stages efficacement</span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-7xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.1] animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            Un simple lien pour <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              bâtir votre avenir
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            Connectez-vous aux meilleures opportunités, suivez votre progression et accédez à un réseau exclusif
            d'écoles et d'entreprises partenaires.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center mb-20 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link
              to="/offers"
              className="group relative bg-zinc-900 text-white font-semibold py-3 px-10 rounded-xl overflow-hidden transition-transform hover:-translate-y-1 shadow-xl shadow-green-900/10 active:scale-95"
            >
              <span className="relative z-10 text-base tracking-wide">Voir les offres</span>
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rotate-45 translate-x-6 -translate-y-6 group-hover:scale-110 transition-transform duration-300" />
              <svg className="absolute top-2.5 right-2.5 w-4 h-4 text-zinc-900 z-20 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>
          </div>

          {/* Dashboard Image with Snake Border */}
          <div className="relative max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500/30 via-emerald-500/30 to-teal-500/30 rounded-2xl blur-3xl opacity-50" />
            <div className="relative w-full rounded-2xl overflow-hidden p-[2px] z-10">
              <div className="absolute inset-[-50%] bg-[conic-gradient(transparent_270deg,#16a34a_360deg)] animate-spin" style={{ animationDuration: '4s', animationTimingFunction: 'linear' }} />
              <div className="relative bg-white rounded-[14px] overflow-hidden">
                <img src={heroImage} alt="Interface de la plateforme LINK" className="w-full h-auto block rounded-[14px]" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
      </main>

      {/* ── Partners ─────────────────────────────────────────── */}
      <section className="py-10 border-b border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-8">
            Partenaires de confiance
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="font-bold text-2xl text-zinc-800 flex items-center gap-2"><div className="w-6 h-6 bg-blue-600 rounded-sm" />YouCode</div>
            <div className="font-bold text-2xl text-zinc-800 flex items-center gap-2"><div className="w-6 h-6 bg-red-500 rounded-full" />Simplon</div>
            <div className="font-bold text-2xl text-zinc-800 flex items-center gap-2"><div className="w-6 h-6 bg-black rounded-lg" />1337</div>
            <div className="font-bold text-2xl text-zinc-800 flex items-center gap-2"><div className="w-6 h-6 bg-green-600 rounded-tr-xl" />EMSI</div>
            <div className="font-bold text-2xl text-zinc-800 flex items-center gap-2"><div className="w-6 h-6 bg-blue-900 rounded-full" />OFPPT</div>
          </div>
        </div>
      </section>

      {/* ── Features (Bento Grid) ─────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal-on-scroll">
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight sm:text-4xl">Fonctionnalités de la plateforme</h2>
            <p className="mt-4 text-zinc-500 text-lg">Tout ce dont vous avez besoin pour gérer votre parcours étudiant.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { delay: 100, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />, title: 'Suivi en temps réel', desc: 'Visualisez votre progression avec des données précises. Suivez vos candidatures, vos expériences et vos offres en un coup d\'œil.' },
              { delay: 200, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />, title: 'Career Lab', desc: 'Tableau de bord intégré pour la recherche de stage. Connectez-vous directement avec des employeurs partenaires.' },
              { delay: 300, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />, title: 'Validation automatique', desc: 'Économisez des heures grâce à la validation automatique de vos compétences et à l\'accès à des ressources exclusives.' },
            ].map(({ delay, icon, title, desc }) => (
              <div
                key={title}
                className="group p-8 bg-zinc-50 border border-zinc-100 rounded-2xl hover:border-zinc-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 reveal-on-scroll"
                style={{ transitionDelay: `${delay}ms` }}
              >
                <div className="h-12 w-12 bg-white border border-zinc-200 rounded-xl flex items-center justify-center mb-6 text-zinc-900 shadow-sm group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900">{title}</h3>
                <p className="text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Offers ─────────────────────────────────────── */}
      <section className="py-24 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal-on-scroll">
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight sm:text-4xl">Opportunités Recentes</h2>
            <p className="mt-4 text-zinc-500 text-lg">Découvrez les dernières offres de stage et d'emploi de nos partenaires.</p>
          </div>

          {isLoading ? (
            <div className="text-center text-zinc-500 py-12">Chargement des offres...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {offers.map((offer, i) => (
                <OfferCard key={offer._id} offer={offer} delay={i * 100} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center reveal-on-scroll">
            <Link
              to="/offers"
              className="bg-white border border-zinc-300 text-zinc-700 font-medium py-3 px-8 rounded-lg hover:bg-zinc-50 hover:border-zinc-400 transition-all shadow-sm"
            >
              Voir plus d'offres
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it Works (Timeline) ───────────────────────────── */}
      <section className="py-24 bg-zinc-50 border-t border-zinc-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-green-100 opacity-50 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 reveal-on-scroll">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-zinc-900 tracking-tight sm:text-4xl">Parcours simplifié</h2>
              <p className="mt-4 text-zinc-500 text-lg">De l'inscription à l'emploi, LINK s'occupe de tout.</p>
            </div>
            <Link to="/experiences" className="hidden md:flex items-center text-green-600 font-semibold hover:text-green-700 mt-4 md:mt-0">
              Voir les expériences &nbsp;
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 -translate-y-1/2 z-0" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {[
                { n: 1, label: 'Inscription', desc: 'Créez votre profil et rejoignez votre promotion.', filled: true, dark: true },
                { n: 2, label: 'Exploration', desc: 'Parcourez les offres et expériences des anciens.', filled: false, dark: false },
                { n: 3, label: 'Candidature', desc: 'Postulez et suivez vos candidatures en kanban.', filled: false, dark: false },
                { n: 4, label: 'Placement', desc: 'Signez votre contrat et démarrez votre carrière.', filled: true, dark: false, green: true },
              ].map(({ n, label, desc, dark, green }, i) => (
                <div
                  key={n}
                  className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow reveal-on-scroll"
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg mb-4 ${green ? 'bg-green-500 text-white shadow-lg shadow-green-200' : dark ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-200' : 'bg-white border-2 border-zinc-900 text-zinc-900'}`}>
                    {n}
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900 mb-2">{label}</h4>
                  <p className="text-sm text-zinc-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 reveal-on-scroll">
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight sm:text-4xl">Avis de la communauté</h2>
            <p className="mt-4 text-zinc-500 text-lg">Ce que disent les étudiants et admins qui utilisent LINK au quotidien.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-100 reveal-on-scroll">
              <Stars />
              <p className="text-zinc-700 mb-6 leading-relaxed">
                "LINK a transformé notre façon de gérer les stages. La boucle de feedback des anciens est inestimable pour des placements pertinents. Un vrai changement de paradigme."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center font-bold text-zinc-500">SB</div>
                <div>
                  <div className="font-bold text-zinc-900 text-sm">Sarah B.</div>
                  <div className="text-xs text-zinc-500">Alumni YouCode '23</div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-100 reveal-on-scroll" style={{ transitionDelay: '150ms' }}>
              <Stars />
              <p className="text-zinc-700 mb-6 leading-relaxed">
                "Le tableau de bord centralisé pour suivre les candidatures m'a fait gagner des heures de travail manuel sur des tableurs. Je le recommande vivement."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center font-bold text-zinc-500">MK</div>
                <div>
                  <div className="font-bold text-zinc-900 text-sm">Mehdi K.</div>
                  <div className="text-xs text-zinc-500">Admin 1337</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-zinc-900 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden reveal-on-scroll">
          <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Prêt à booster votre carrière ?</h2>
            <p className="text-zinc-400 text-base md:text-xl max-w-2xl mx-auto mb-8">
              Rejoignez des centaines d'étudiants qui utilisent LINK pour trouver leur stage idéal.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/offers" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-green-900/50">
                Voir les offres
              </Link>
              <Link to="/profile" className="bg-white/10 backdrop-blur-md text-white border border-white/10 font-bold py-3 px-8 rounded-lg hover:bg-white/20 transition-colors">
                Mon profil
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-white border-t border-zinc-200 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-zinc-900 text-white p-1 rounded">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-bold text-xl text-zinc-900">LINK</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                Accompagner la prochaine génération d'ingénieurs à travers une gestion éducative pilotée par les données.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">Navigation</h3>
              <ul className="space-y-3 text-sm text-zinc-600">
                <li><Link to="/home" className="hover:text-green-600 transition-colors">Home</Link></li>
                <li><Link to="/offers" className="hover:text-green-600 transition-colors">Offres</Link></li>
                <li><Link to="/experiences" className="hover:text-green-600 transition-colors">Expériences</Link></li>
                <li><Link to="/kanban" className="hover:text-green-600 transition-colors">Mes candidatures</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">Ressources</h3>
              <ul className="space-y-3 text-sm text-zinc-600">
                <li><Link to="/profile" className="hover:text-green-600 transition-colors">Mon Profil</Link></li>
                <li><a href="#" className="hover:text-green-600 transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-green-600 transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-900 uppercase tracking-wider mb-4">Légal</h3>
              <ul className="space-y-3 text-sm text-zinc-600">
                <li><a href="#" className="hover:text-green-600 transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-green-600 transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-green-600 transition-colors">Conditions</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-zinc-400 text-sm text-center md:text-left">
              &copy; 2026 LINK. Made with <span className="text-red-400">❤</span> for YouCode.
            </p>
            <div className="flex gap-4 items-center">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs text-zinc-500">Tous les systèmes opérationnels</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
