import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline';
import { companyService } from '../../services';

export default function CompaniesPage() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [tech, setTech] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['companies', search, city, tech, page],
    queryFn: () => companyService.getAll({ search, city, tech, page, limit: 12 }).then((r) => r.data),
    keepPreviousData: true,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Entreprises</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Rechercher une entreprise..."
            className="input pl-9"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <input type="text" placeholder="Ville" className="input sm:w-40" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }} />
        <input type="text" placeholder="Technologie" className="input sm:w-40" value={tech} onChange={(e) => { setTech(e.target.value); setPage(1); }} />
      </div>

      {isLoading && <div className="text-center py-16 text-gray-400">Chargement...</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {data?.data?.companies?.map((company) => (
          <Link key={company._id} to={`/companies/${company._id}`} className="card hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {company.logo
                  ? <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
                  : <span className="text-lg font-bold text-gray-400">{company.name?.[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 truncate">{company.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                  <MapPinIcon className="w-3.5 h-3.5" />
                  <span>{company.city || '—'}</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-medium">{company.averageRating?.toFixed(1) || '—'}</span>
                  <span className="text-xs text-gray-400">({company.reviewCount} avis)</span>
                </div>
              </div>
            </div>
            {company.technologies?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {company.technologies.slice(0, 4).map((t) => (
                  <span key={t} className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {data?.total > 12 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-1.5 text-sm">Précédent</button>
          <span className="px-3 py-1.5 text-sm text-gray-600">Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page * 12 >= data?.total} className="btn-secondary px-3 py-1.5 text-sm">Suivant</button>
        </div>
      )}
    </div>
  );
}
