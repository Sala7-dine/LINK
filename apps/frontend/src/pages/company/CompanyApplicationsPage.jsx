import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { offerService } from '../../services';

const statusOptions = ['interview', 'accepted', 'rejected'];

export default function CompanyApplicationsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      companyName: '',
      description: '',
      location: '',
      contractType: 'stage',
    },
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['company-applications-page', search, statusFilter, sortBy],
    queryFn: () => offerService
      .getCompanyApplicants({
        search: search || undefined,
        status: statusFilter || undefined,
        sortBy,
      })
      .then((r) => r.data.data),
  });

  const createOfferMutation = useMutation({
    mutationFn: (payload) => offerService.create(payload),
    onSuccess: () => {
      toast.success('Offre creee avec succes');
      reset();
      queryClient.invalidateQueries({ queryKey: ['company-applications-page'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la creation de l\'offre');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => offerService.updateCompanyApplicationStatus(id, { status }),
    onSuccess: () => {
      toast.success('Statut candidature mis a jour');
      queryClient.invalidateQueries({ queryKey: ['company-applications-page'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erreur lors de la mise a jour du statut');
    },
  });

  const applications = useMemo(() => data?.applications || [], [data]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Candidatures recues</h1>

      <div className="card max-w-3xl">
        <h2 className="font-semibold mb-4">Creer une offre</h2>
        <form className="space-y-4" onSubmit={handleSubmit((values) => createOfferMutation.mutate(values))}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre</label>
              <input {...register('title', { required: true })} className="input" placeholder="Stage Fullstack" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entreprise</label>
              <input {...register('companyName', { required: true })} className="input" placeholder="Acme Corp" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea {...register('description')} className="input" rows={3} placeholder="Description du poste" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localisation</label>
              <input {...register('location')} className="input" placeholder="Casablanca / Remote" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type contrat</label>
              <select {...register('contractType')} className="input">
                <option value="stage">stage</option>
                <option value="alternance">alternance</option>
                <option value="cdi">cdi</option>
                <option value="cdd">cdd</option>
                <option value="freelance">freelance</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={isSubmitting || createOfferMutation.isPending}>
            {isSubmitting || createOfferMutation.isPending ? 'Creation...' : 'Publier l\'offre'}
          </button>
        </form>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold">Filtres candidatures</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            placeholder="Rechercher etudiant ou offre"
          />
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="interested">interested</option>
            <option value="applied">applied</option>
            <option value="interview">interview</option>
            <option value="accepted">accepted</option>
            <option value="rejected">rejected</option>
          </select>
          <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Plus recentes</option>
            <option value="oldest">Plus anciennes</option>
            <option value="status">Par statut</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Liste des candidatures</h2>

        {isLoading && <p className="text-gray-500">Chargement...</p>}
        {isError && <p className="text-red-500">Erreur lors du chargement.</p>}

        {!isLoading && !isError && (
          <div className="space-y-3">
            {applications.map((app) => (
              <div key={app._id} className="border border-gray-100 dark:border-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{app?.student?.name || 'Etudiant'}</p>
                    <p className="text-sm text-gray-500">{app?.student?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Offre: {app?.offer?.title} ({app?.offer?.companyName})
                    </p>
                  </div>
                  <select
                    className="input text-sm w-40"
                    value={app.status}
                    onChange={(e) => updateStatusMutation.mutate({ id: app._id, status: e.target.value })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <option value="interested">interested</option>
                    <option value="applied">applied</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <p><strong>Promotion:</strong> {app?.student?.promotion || '-'}</p>
                  <p><strong>LinkedIn:</strong> {app?.student?.linkedinUrl || '-'}</p>
                  <p><strong>GitHub:</strong> {app?.student?.githubUrl || '-'}</p>
                  <p><strong>Portfolio:</strong> {app?.student?.portfolio || '-'}</p>
                </div>

                {app?.student?.bio && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300"><strong>Bio:</strong> {app.student.bio}</p>
                )}
              </div>
            ))}
            {applications.length === 0 && <p className="text-gray-500">Aucune candidature pour le moment.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
