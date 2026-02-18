import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { offerService } from '../../services';
import { toast } from 'react-toastify';

export default function OffersPage() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [tech, setTech] = useState('');
  const [contractType, setContractType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['offers', search, location, tech, contractType, page],
    queryFn: () => offerService.getAll({ search, location, tech, contractType, page, limit: 15 }).then((r) => r.data),
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Offres de stage</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Rechercher..." className="input pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <input type="text" placeholder="Ville / Remote" className="input sm:w-36" value={location} onChange={(e) => setLocation(e.target.value)} />
        <input type="text" placeholder="Technologie" className="input sm:w-36" value={tech} onChange={(e) => setTech(e.target.value)} />
        <select className="input sm:w-36" value={contractType} onChange={(e) => setContractType(e.target.value)}>
          <option value="">Tous types</option>
          <option value="stage">Stage</option>
          <option value="alternance">Alternance</option>
          <option value="cdi">CDI</option>
        </select>
      </div>

      {isLoading && <div className="text-center py-16 text-gray-400">Chargement...</div>}

      <div className="space-y-3">
        {data?.data?.offers?.map((offer) => (
          <div key={offer._id} className="card flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              {offer.companyLogo
                ? <img src={offer.companyLogo} alt={offer.companyName} className="w-full h-full object-contain rounded-lg" />
                : <BriefcaseIcon className="w-5 h-5 text-gray-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/offers/${offer._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 block truncate">{offer.title}</Link>
              <p className="text-sm text-gray-500">{offer.companyName}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
                {offer.location && <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />{offer.location}</span>}
                {offer.isRemote && <span className="bg-green-50 dark:bg-green-900/20 text-green-600 px-2 py-0.5 rounded-full">Remote</span>}
                <span className="capitalize bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full">{offer.contractType}</span>
              </div>
              {offer.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {offer.technologies.slice(0, 5).map((t) => (
                    <span key={t} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => handleApply(offer._id)} className="btn-primary text-sm flex-shrink-0">Suivre</button>
          </div>
        ))}
      </div>

      {data?.data?.offers?.length === 0 && !isLoading && (
        <div className="card text-center text-gray-400 py-12">Aucune offre correspondante.</div>
      )}
    </div>
  );
}
