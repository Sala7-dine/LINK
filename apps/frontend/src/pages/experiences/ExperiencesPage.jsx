import { useMemo, useState, useEffect, useRef } from 'react';
import PageHero from '../../components/common/PageHero';
import { useQuery } from '@tanstack/react-query';
import { experienceService } from '../../services';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const TYPE_LABELS = {
  first_year_internship: 'Stage 1ère année',
  second_year_internship: 'Stage 2ème année',
  second_year_cdi: 'CDI 2ème année',
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};

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

export default function ExperiencesPage() {
  const [search, setSearch] = useState('');
  useRevealOnScroll();

  const { data, isLoading } = useQuery({
    queryKey: ['experiences', search],
    queryFn: () => experienceService.getAll({ search: search || undefined, limit: 'all' }).then((r) => r.data.data.experiences),
  });

  const experiences = useMemo(() => data || [], [data]);

  return (
    <>
      <PageHero 
        title="Expériences Étudiant" 
        description="Découvrez les retours de stage et emplois des anciens pour préparer votre parcours."
        bgImage="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000"
      />
      <div className="space-y-8 animate-fade-in-up">
        {/* Search Bar */}
        <div className="flex justify-end relative">
          <div className="w-full md:w-80 relative flex-shrink-0 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-zinc-400 group-focus-within:text-green-500 transition-colors" />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher entreprise, tech..."
            className="w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-md border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm placeholder:text-zinc-400"
          />
        </div>
      </div>

      {isLoading && (
        <div className="py-20 text-center">
          <div className="inline-block relative w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-green-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-zinc-500 font-medium">Chargement des expériences...</p>
        </div>
      )}

      {!isLoading && experiences.length === 0 && (
        <div className="bg-white/50 backdrop-blur-md border border-zinc-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Aucun résultat</h3>
          <p className="text-zinc-500">Aucune expérience partagée pour le moment avec ces critères.</p>
        </div>
      )}

      {/* Grid of Experiences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        {experiences.map((exp, i) => (
          <article 
            key={exp._id} 
            className="bg-white p-8 rounded-[24px] border border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 reveal-on-scroll flex flex-col h-full"
            style={{ transitionDelay: `${i * 50}ms` }}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 mb-1 leading-tight">{exp.companyName}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    {TYPE_LABELS[exp.experienceType] || exp.experienceType}
                  </span>
                </div>
              </div>
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-600 whitespace-nowrap flex-shrink-0">
                {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
              </span>
            </div>

            {/* Location & Content */}
            <div className="flex items-center gap-1.5 text-zinc-500 text-sm mb-4 font-medium">
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {exp.location}
            </div>

            {exp.description && (
              <p className="text-zinc-600 leading-relaxed mb-6 line-clamp-4 flex-grow">{exp.description}</p>
            )}

            {/* Technologies */}
            {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {exp.technologies.map((tech) => (
                  <span key={tech} className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 text-zinc-700 font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Links & Footer */}
            <div className="mt-auto pt-6 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex gap-4">
                {exp.companyWebsiteUrl && (
                  <a href={exp.companyWebsiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-semibold text-zinc-900 hover:text-green-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    Site Web
                  </a>
                )}
                {exp.companyLinkedinUrl && (
                  <a href={exp.companyLinkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-semibold text-zinc-900 hover:text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    LinkedIn
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {exp.author?.name ? exp.author.name[0].toUpperCase() : 'E'}
                </div>
                <span className="text-sm font-medium text-zinc-500">
                  {exp.author?.name || 'Étudiant Anonyme'}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
    </>
  );
}
