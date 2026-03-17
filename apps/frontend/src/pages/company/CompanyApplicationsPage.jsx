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
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-2">Candidatures reçues</h1>

      <div className="bg-white/60 backdrop-blur-2xl p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <h2 className="text-xl font-bold text-zinc-900 mb-6 relative z-10">Créer une offre</h2>
        <form className="space-y-5 relative z-10" onSubmit={handleSubmit((values) => createOfferMutation.mutate(values))}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">Titre</label>
              <input {...register('title', { required: true })} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner" placeholder="Stage Fullstack" />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">Entreprise</label>
              <input {...register('companyName', { required: true })} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner" placeholder="Acme Corp" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">Description</label>
            <textarea {...register('description')} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner resize-none" rows={3} placeholder="Description du poste" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">Localisation</label>
              <input {...register('location')} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner" placeholder="Casablanca / Remote" />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">Type contrat</label>
              <select {...register('contractType')} className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner appearance-none">
                <option value="stage">Stage</option>
                <option value="alternance">Alternance</option>
                <option value="cdi">CDI</option>
                <option value="cdd">CDD</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full sm:w-auto bg-zinc-900 text-white font-bold py-3 px-8 rounded-xl hover:-translate-y-0.5 shadow-lg shadow-zinc-900/20 active:scale-95 transition-all text-sm mt-2" disabled={isSubmitting || createOfferMutation.isPending}>
            {isSubmitting || createOfferMutation.isPending ? 'Création...' : 'Publier l\'offre'}
          </button>
        </form>
      </div>

      <div className="bg-white/60 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
        <h2 className="text-xl font-bold text-zinc-900">Filtres candidatures</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner"
            placeholder="Rechercher un étudiant ou offre"
          />
          <select 
            className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner appearance-none" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="interested">Intéressé</option>
            <option value="applied">Postulé</option>
            <option value="interview">Entretien</option>
            <option value="accepted">Accepté</option>
            <option value="rejected">Refusé</option>
          </select>
          <select 
            className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner appearance-none" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Plus récentes</option>
            <option value="oldest">Plus anciennes</option>
            <option value="status">Par statut</option>
          </select>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Liste des candidatures</h2>

        {isLoading && <p className="text-zinc-500 font-medium py-8 text-center animate-pulse">Chargement en cours...</p>}
        {isError && <p className="text-red-500 font-medium py-8 text-center">Erreur lors du chargement.</p>}

        {!isLoading && !isError && (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app._id} className="bg-white/50 hover:bg-white/80 transition-colors border border-white/60 shadow-sm rounded-2xl p-5 group flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-zinc-900 text-lg">{app?.student?.name || 'Étudiant'}</p>
                    <p className="text-sm font-medium text-zinc-500">{app?.student?.email}</p>
                    <p className="text-xs font-bold text-zinc-400 mt-2 bg-white px-3 py-1 rounded-lg shadow-inner inline-block">
                      Offre: {app?.offer?.title} ({app?.offer?.companyName})
                    </p>
                  </div>
                  <select
                    className={`px-4 py-2 sm:w-40 rounded-xl text-sm font-bold border-2 transition-colors cursor-pointer appearance-none text-center bg-white shadow-sm focus:ring-2 focus:outline-none focus:border-green-500
                    ${app.status === 'accepted' ? 'border-green-200 text-green-700' :
                    app.status === 'rejected' ? 'border-red-200 text-red-700' :
                    app.status === 'interview' ? 'border-purple-200 text-purple-700' :
                    'border-blue-200 text-blue-700'}`}
                    value={app.status}
                    onChange={(e) => updateStatusMutation.mutate({ id: app._id, status: e.target.value })}
                    disabled={updateStatusMutation.isPending}
                  >
                    <option value="interested">Intéressé 👀</option>
                    <option value="applied">Postulé 📝</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status === 'interview' ? 'Entretien 💬' : status === 'accepted' ? 'Accepté ✅' : 'Refusé ❌'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-2 pt-5 border-t border-zinc-200/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <p><strong className="block text-zinc-400 font-bold mb-1 text-xs uppercase tracking-wider">Promotion</strong> <span className="font-semibold text-zinc-800">{app?.student?.promotion || '-'}</span></p>
                  <p><strong className="block text-zinc-400 font-bold mb-1 text-xs uppercase tracking-wider">LinkedIn</strong> {app?.student?.linkedinUrl ? <a href={app.student.linkedinUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold hover:underline">Profil</a> : '-'}</p>
                  <p><strong className="block text-zinc-400 font-bold mb-1 text-xs uppercase tracking-wider">GitHub</strong> {app?.student?.githubUrl ? <a href={app.student.githubUrl} target="_blank" rel="noreferrer" className="text-zinc-800 font-semibold hover:underline">Profil</a> : '-'}</p>
                  <p><strong className="block text-zinc-400 font-bold mb-1 text-xs uppercase tracking-wider">Portfolio</strong> {app?.student?.portfolio ? <a href={app.student.portfolio} target="_blank" rel="noreferrer" className="text-green-600 font-semibold hover:underline">Lien</a> : '-'}</p>
                </div>

                {app?.student?.bio && (
                  <div className="bg-zinc-50/50 rounded-xl p-4 border border-zinc-200/50 mt-2">
                    <strong className="block text-zinc-400 font-bold mb-1 text-xs uppercase tracking-wider">Bio</strong>
                    <p className="text-sm font-medium text-zinc-700 italic">"{app.student.bio}"</p>
                  </div>
                )}
              </div>
            ))}
            {applications.length === 0 && <p className="text-zinc-500 font-medium text-center py-8">Aucune candidature pour le moment.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
