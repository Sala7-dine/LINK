import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { offerService } from '../../services';

export default function LandingOffersPreview() {
  const { data, isLoading } = useQuery({
    queryKey: ['landing-offers'],
    queryFn: () => offerService.getAll({ limit: 4 }).then((r) => r.data.data.offers),
    retry: false,
  });

  return (
    <section id="offers" className="py-20 bg-zinc-50 border-y border-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="text-3xl font-bold text-zinc-900">Apercu des offres</h2>
            <p className="text-zinc-600 mt-2">
              Exemples d opportunites publiees sur la plateforme.
            </p>
          </div>
          <Link to="/login" className="btn-secondary">
            Voir tout apres connexion
          </Link>
        </div>

        {isLoading && <div className="card text-center">Chargement...</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data || []).slice(0, 4).map((offer) => (
            <article key={offer._id} className="card bg-white">
              <h3 className="font-semibold text-zinc-900">{offer.title}</h3>
              <p className="text-sm text-zinc-500 mt-1">
                {offer.companyName || 'Entreprise partenaire'}
              </p>
              <p className="text-sm text-zinc-600 mt-2">
                {offer.location || 'Localisation a definir'}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
