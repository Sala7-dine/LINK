import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { offerService } from '../../services';
import { toast } from 'react-toastify';

export default function OfferDetailPage() {
  const { id } = useParams();
  const { data: offer, isLoading } = useQuery({
    queryKey: ['offer', id],
    queryFn: () => offerService.getOne(id).then((r) => r.data.data.offer),
  });

  const handleApply = async () => {
    try {
      await offerService.apply(id, { status: 'applied' });
      toast.success('Candidature enregistrée dans votre Kanban !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  if (isLoading) return <div className="text-center py-20 text-gray-400">Chargement...</div>;
  if (!offer) return <div className="text-center py-20 text-red-400">Offre introuvable.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-xl font-bold">{offer.title}</h1>
            <p className="text-gray-500 mt-1">{offer.companyName}</p>
          </div>
          <div className="flex gap-2">
            {offer.externalUrl && (
              <a
                href={offer.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm"
              >
                Voir l'annonce
              </a>
            )}
            <button onClick={handleApply} className="btn-primary text-sm">
              Postuler
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
          {offer.location && (
            <span className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              {offer.location}
            </span>
          )}
          <span className="flex items-center gap-1 capitalize">
            <BriefcaseIcon className="w-4 h-4" />
            {offer.contractType}
          </span>
          {offer.duration && (
            <span className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              {offer.duration}
            </span>
          )}
          {offer.isPaid && (
            <span className="flex items-center gap-1 text-green-600">
              <CurrencyDollarIcon className="w-4 h-4" />
              Rémunéré {offer.salary && `· ${offer.salary}`}
            </span>
          )}
        </div>

        {offer.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-4">
            {offer.technologies.map((t) => (
              <span
                key={t}
                className="text-sm bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-3 py-1 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {offer.description && (
        <div className="card">
          <h2 className="font-semibold mb-3">Description du poste</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {offer.description}
          </p>
        </div>
      )}

      {offer.requirements && (
        <div className="card">
          <h2 className="font-semibold mb-3">Profil recherché</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {offer.requirements}
          </p>
        </div>
      )}
    </div>
  );
}
