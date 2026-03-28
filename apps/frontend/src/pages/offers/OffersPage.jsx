import { useState, useEffect, useRef } from 'react';
import PageHero from '../../components/common/PageHero';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { offerService } from '../../services';
import { toast } from 'react-toastify';

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

export default function OffersPage() {
  const user = useSelector(selectUser);
  const isStudent = user?.role === 'student';

  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [tech, setTech] = useState('');
  const [contractType, setContractType] = useState('');
  const [page, setPage] = useState(1);
  useRevealOnScroll();

  const { data, isLoading } = useQuery({
    queryKey: ['offers', search, location, tech, contractType, page],
    queryFn: () =>
      offerService
        .getAll({ search, location, tech, contractType, page, limit: 15 })
        .then((r) => r.data),
    keepPreviousData: true,
  });

  const handleApply = async (id) => {
    try {
      await offerService.apply(id, { status: 'interested' });
      toast.success('Offre ajoutée à votre Kanban !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <>
      {isStudent && (
        <PageHero
          title="Offres de stage"
          description="Explorez les opportunités disponibles et trouvez le stage fait pour vous."
          bgImage="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000"
        />
      )}
      <div className="space-y-8 animate-fade-in-up">
        {/* Filters Bar (Glassmorphic) */}
        <div className="bg-white/50 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4 relative z-10">
          <div className="relative flex-1 group">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-green-500 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher une offre..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm placeholder:text-zinc-400 font-medium"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-shrink-0 md:w-auto w-full">
            <input
              type="text"
              placeholder="Ville / Remote"
              className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm placeholder:text-zinc-400"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <input
              type="text"
              placeholder="Technologie"
              className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm placeholder:text-zinc-400"
              value={tech}
              onChange={(e) => setTech(e.target.value)}
            />
            <select
              className="col-span-2 md:col-span-1 w-full px-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm text-zinc-700 font-medium cursor-pointer"
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
            >
              <option value="">Tous types</option>
              <option value="stage">Stage</option>
              <option value="alternance">Alternance</option>
              <option value="cdi">CDI</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="py-20 text-center">
            <div className="inline-block relative w-12 h-12">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-green-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-zinc-500 font-medium">Recherche des offres...</p>
          </div>
        )}

        {/* Offers List */}
        <div className="space-y-4 pb-12">
          {data?.data?.offers?.map((offer, i) => (
            <div
              key={offer._id}
              className="group bg-white p-6 sm:p-8 rounded-[24px] border border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 reveal-on-scroll flex flex-col sm:flex-row items-start sm:items-center gap-6"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              {/* Logo */}
              <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                {offer.companyLogo ? (
                  <img
                    src={offer.companyLogo}
                    alt={offer.companyName}
                    className="w-10 h-10 object-contain"
                  />
                ) : (
                  <BriefcaseIcon className="w-8 h-8 text-zinc-300" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/offers/${offer._id}`}
                  className="text-xl font-bold text-zinc-900 hover:text-green-600 transition-colors block truncate mb-1"
                >
                  {offer.title}
                </Link>
                <p className="text-zinc-500 font-medium mb-3">{offer.companyName}</p>

                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  {offer.location && (
                    <span className="flex items-center gap-1 bg-zinc-100 text-zinc-700 px-3 py-1.5 rounded-full">
                      <MapPinIcon className="w-3.5 h-3.5" />
                      {offer.location}
                    </span>
                  )}
                  {offer.isRemote && (
                    <span className="bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-full">
                      Remote
                    </span>
                  )}
                  <span className="capitalize bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-full">
                    {offer.contractType || 'Stage'}
                  </span>
                </div>

                {/* Technologies */}
                {offer.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {offer.technologies.slice(0, 5).map((t) => (
                      <span
                        key={t}
                        className="text-xs font-medium border border-zinc-200 text-zinc-600 px-3 py-1 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                    {offer.technologies.length > 5 && (
                      <span className="text-xs font-bold text-zinc-400 px-2 py-1">
                        +{offer.technologies.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="w-full sm:w-auto mt-4 sm:mt-0 flex-shrink-0">
                <button
                  onClick={() => handleApply(offer._id)}
                  className="w-full sm:w-auto group/btn relative bg-zinc-900 text-white font-semibold py-3 px-8 rounded-xl overflow-hidden hover:-translate-y-0.5 shadow-lg shadow-zinc-900/20 active:scale-95 transition-all text-sm"
                >
                  <span className="relative z-10 transition-colors">Suivre l'offre</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {data?.data?.offers?.length === 0 && !isLoading && (
          <div className="bg-white/50 backdrop-blur-md border border-zinc-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BriefcaseIcon className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Aucune offre trouvée</h3>
            <p className="text-zinc-500">Essayez de modifier vos critères de recherche.</p>
          </div>
        )}
      </div>
    </>
  );
}
