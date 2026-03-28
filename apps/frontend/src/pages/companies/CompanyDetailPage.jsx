import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StarIcon, MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { companyService, reviewService } from '../../services';
import ReviewCard from '../../components/ui/ReviewCard';

export default function CompanyDetailPage() {
  const { id } = useParams();

  const { data: companyData } = useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.getOne(id).then((r) => r.data.data.company),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewService.getByCompany(id).then((r) => r.data.data.reviews),
  });

  const company = companyData;

  if (!company) return <div className="text-center py-20 text-gray-400">Chargement...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="card flex items-start gap-6">
        <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
          {company.logo ? (
            <img src={company.logo} alt={company.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-2xl font-bold text-gray-400">{company.name?.[0]}</span>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              {company.city || '—'}
            </span>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary-600 hover:underline"
              >
                <GlobeAltIcon className="w-4 h-4" />
                Site web
              </a>
            )}
            <span className="flex items-center gap-1">
              <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {company.averageRating?.toFixed(1) || '—'} ({company.reviewCount} avis)
            </span>
          </div>
          {company.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {company.technologies.map((t) => (
                <span
                  key={t}
                  className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-2 py-0.5 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {company.description && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{company.description}</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Avis ({reviewsData?.length || 0})</h2>
        {reviewsData?.length === 0 && (
          <div className="card text-center text-gray-400">
            Aucun avis pour le moment. Soyez le premier !
          </div>
        )}
        <div className="space-y-4">
          {reviewsData?.map((review) => (
            <ReviewCard key={review._id} review={review} />
          ))}
        </div>
      </div>
    </div>
  );
}
