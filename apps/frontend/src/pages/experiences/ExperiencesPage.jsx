import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { experienceService } from '../../services';

const TYPE_LABELS = {
  first_year_internship: 'Stage 1ere annee',
  second_year_internship: 'Stage 2eme annee',
  second_year_cdi: 'CDI 2eme annee',
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};

export default function ExperiencesPage() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['experiences', search],
    queryFn: () => experienceService.getAll({ search: search || undefined, limit: 'all' }).then((r) => r.data.data.experiences),
  });

  const experiences = useMemo(() => data || [], [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Experiences etudiant</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher entreprise ou localisation"
          className="input w-full sm:w-80"
        />
      </div>

      {isLoading && <div className="card text-center">Chargement...</div>}

      {!isLoading && experiences.length === 0 && (
        <div className="card text-center text-gray-500">Aucune experience partagee pour le moment.</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {experiences.map((exp) => (
          <article key={exp._id} className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{exp.companyName}</h2>
                <p className="text-sm text-gray-500">{TYPE_LABELS[exp.experienceType] || exp.experienceType}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700">
                {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
              </span>
            </div>

            <div className="text-sm text-gray-600">
              <p>{exp.location}</p>
            </div>

            {exp.description && <p className="text-sm text-gray-600">{exp.description}</p>}

            {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exp.technologies.map((tech) => (
                  <span key={tech} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-sm">
              {exp.companyLinkedinUrl && (
                <a
                  href={exp.companyLinkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  LinkedIn entreprise
                </a>
              )}
              {exp.companyWebsiteUrl && (
                <a
                  href={exp.companyWebsiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 hover:underline"
                >
                  Site web
                </a>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 text-sm text-gray-500">
              Partage par {exp.author?.name || 'Etudiant'}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
