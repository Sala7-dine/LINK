import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { companyService, dashboardService, offerService } from '../../services';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const StatCard = ({ label, value, color = 'text-green-600' }) => (
  <div className="bg-white/60 backdrop-blur-2xl p-6 rounded-[24px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
    <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-500" />
    <p className="text-sm font-bold text-zinc-500 relative z-10 uppercase tracking-wider">
      {label}
    </p>
    <p className={`text-4xl font-black mt-3 relative z-10 ${color}`}>{value}</p>
  </div>
);

export default function DashboardPage() {
  const user = useSelector(selectUser);
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.get().then((r) => r.data.data),
    enabled: user?.role === 'school_admin',
  });

  const {
    data: superData,
    isLoading: isSuperLoading,
    isError: isSuperError,
  } = useQuery({
    queryKey: ['dashboard-super-admin'],
    queryFn: () => dashboardService.getSuperAdmin().then((r) => r.data.data),
    enabled: user?.role === 'super_admin',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: { email: '', companyName: '' },
  });

  const inviteMutation = useMutation({
    mutationFn: (payload) => companyService.invitePartner(payload),
    onSuccess: ({ data: response }) => {
      toast.success(response?.message || 'Invitation partenaire creee');
      reset();
      queryClient.invalidateQueries({ queryKey: ['dashboard-super-admin'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Erreur lors de l'invitation partenaire");
    },
  });

  const {
    data: companyApplicantsData,
    isLoading: isCompanyApplicantsLoading,
    isError: isCompanyApplicantsError,
  } = useQuery({
    queryKey: ['company-applicants'],
    queryFn: () => offerService.getCompanyApplicants().then((r) => r.data.data),
    enabled: user?.role === 'company_admin',
  });

  const {
    register: registerOffer,
    handleSubmit: handleSubmitOffer,
    reset: resetOffer,
    formState: { isSubmitting: isOfferSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      companyName: '',
      description: '',
      location: '',
      contractType: 'stage',
    },
  });

  const createOfferMutation = useMutation({
    mutationFn: (payload) => offerService.create(payload),
    onSuccess: () => {
      toast.success('Offre creee avec succes');
      resetOffer();
      queryClient.invalidateQueries({ queryKey: ['company-applicants'] });
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Erreur lors de la creation de l'offre");
    },
  });

  if (!['school_admin', 'super_admin', 'company_admin'].includes(user?.role)) {
    return (
      <div className="animate-fade-in-up space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-2">
          Tableau de bord
        </h1>
        <div className="bg-white/60 backdrop-blur-2xl p-8 sm:p-10 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <p className="text-lg text-zinc-600 relative z-10 font-medium">
            Bienvenue, <strong className="text-zinc-900 font-bold">{user?.name}</strong> ! Explorez
            les entreprises et trouvez votre stage idéal.
          </p>
        </div>
      </div>
    );
  }

  if (user?.role === 'company_admin') {
    if (isCompanyApplicantsLoading)
      return <div className="text-center py-20 text-gray-400">Chargement...</div>;
    if (isCompanyApplicantsError)
      return (
        <div className="text-center py-20 text-red-400">
          Erreur lors du chargement des candidatures.
        </div>
      );

    const applications = companyApplicantsData?.applications || [];

    return (
      <div className="space-y-8 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-2">
          Dashboard Company Admin
        </h1>

        <div className="bg-white/60 backdrop-blur-2xl p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <h2 className="text-xl font-bold text-zinc-900 mb-6 relative z-10">Créer une offre</h2>
          <form
            className="space-y-5 relative z-10"
            onSubmit={handleSubmitOffer((values) => createOfferMutation.mutate(values))}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Titre</label>
                <input
                  {...registerOffer('title', { required: true })}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner"
                  placeholder="Stage Fullstack"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Entreprise</label>
                <input
                  {...registerOffer('companyName', { required: true })}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner"
                  placeholder="Acme Corp"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">Description</label>
              <textarea
                {...registerOffer('description')}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner resize-none"
                rows={3}
                placeholder="Description du poste"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Localisation</label>
                <input
                  {...registerOffer('location')}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner"
                  placeholder="Casablanca / Remote"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-2">Type contrat</label>
                <select
                  {...registerOffer('contractType')}
                  className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner appearance-none"
                >
                  <option value="stage">Stage</option>
                  <option value="alternance">Alternance</option>
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-zinc-900 text-white font-bold py-3 px-8 rounded-xl hover:-translate-y-0.5 shadow-lg shadow-zinc-900/20 active:scale-95 transition-all text-sm mt-2"
              disabled={isOfferSubmitting || createOfferMutation.isPending}
            >
              {isOfferSubmitting || createOfferMutation.isPending
                ? 'Création...'
                : "Publier l'offre"}
            </button>
          </form>
        </div>

        <div className="bg-white/60 backdrop-blur-2xl p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-xl font-bold text-zinc-900 mb-6">Étudiants ayant postulé</h2>
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white/50 hover:bg-white/80 transition-colors border border-white/60 shadow-sm rounded-2xl p-5 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-zinc-900 text-lg">
                      {app?.student?.name || 'Étudiant Anonyme'}
                    </p>
                    <p className="text-sm font-medium text-zinc-500">{app?.student?.email}</p>
                    <p className="text-xs font-bold text-zinc-400 mt-2 bg-white px-3 py-1 rounded-lg shadow-inner inline-block">
                      Offre: {app?.offer?.title} ({app?.offer?.companyName})
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 capitalize shadow-sm border border-blue-200/50">
                    {app.status}
                  </span>
                </div>

                <div className="mt-5 pt-5 border-t border-zinc-200/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {app?.student?.promotion && (
                    <p>
                      <strong className="block text-zinc-400 font-bold mb-1 text-xs uppercase tracking-wider">
                        Promotion
                      </strong>{' '}
                      <span className="font-semibold text-zinc-800">{app.student.promotion}</span>
                    </p>
                  )}
                  {app?.student?.linkedinUrl && (
                    <p>
                      <strong className="block text-zinc-400 font-bold mb-1 text-xs uppercase tracking-wider">
                        LinkedIn
                      </strong>{' '}
                      <a
                        href={app.student.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Profil
                      </a>
                    </p>
                  )}
                  {app?.student?.githubUrl && (
                    <p>
                      <strong className="block text-zinc-400 font-bold mb-1 text-xs uppercase tracking-wider">
                        GitHub
                      </strong>{' '}
                      <a
                        href={app.student.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-800 font-semibold hover:underline"
                      >
                        Profil
                      </a>
                    </p>
                  )}
                  {app?.student?.portfolio && (
                    <p>
                      <strong className="block text-zinc-400 font-bold mb-1 text-xs uppercase tracking-wider">
                        Portfolio
                      </strong>{' '}
                      <a
                        href={app.student.portfolio}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-600 font-semibold hover:underline"
                      >
                        Lien
                      </a>
                    </p>
                  )}
                </div>

                {app?.student?.bio && (
                  <div className="mt-4 bg-zinc-50/50 rounded-xl p-4 border border-zinc-200/50">
                    <strong className="block text-zinc-400 font-bold mb-1 text-xs uppercase tracking-wider">
                      Bio
                    </strong>
                    <p className="text-sm font-medium text-zinc-700 italic">"{app.student.bio}"</p>
                  </div>
                )}
              </div>
            ))}
            {applications.length === 0 && (
              <p className="text-zinc-500 font-medium text-center py-8">
                Aucune candidature pour le moment.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (user?.role === 'super_admin') {
    if (isSuperLoading) return <div className="text-center py-20 text-gray-400">Chargement...</div>;
    if (isSuperError)
      return (
        <div className="text-center py-20 text-red-400">Erreur lors du chargement des données.</div>
      );

    return (
      <div className="space-y-8 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-2">
          Dashboard Super Admin
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            label="Écoles actives"
            value={superData?.totalSchools ?? '—'}
            color="text-zinc-900"
          />
          <StatCard
            label="Utilisateurs"
            value={superData?.totalUsers ?? '—'}
            color="text-blue-600"
          />
          <StatCard label="Avis" value={superData?.totalReviews ?? '—'} color="text-amber-500" />
          <StatCard
            label="Entreprises"
            value={superData?.totalCompanies ?? '—'}
            color="text-green-600"
          />
        </div>

        <div className="bg-white/60 backdrop-blur-2xl p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <h2 className="text-xl font-bold text-zinc-900 mb-6 relative z-10">
            Inviter un partenaire recruteur
          </h2>
          <form
            className="space-y-5 relative z-10"
            onSubmit={handleSubmit((values) => inviteMutation.mutate(values))}
          >
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">Email partenaire</label>
              <input
                {...register('email', { required: true })}
                type="email"
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-zinc-900 shadow-inner"
                placeholder="partenaire@entreprise.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">
                Nom entreprise (optionnel)
              </label>
              <input
                {...register('companyName')}
                type="text"
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-zinc-900 shadow-inner"
                placeholder="Acme Corp"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-zinc-900 text-white font-bold py-3 px-8 rounded-xl hover:-translate-y-0.5 shadow-lg shadow-zinc-900/20 active:scale-95 transition-all text-sm mt-2"
              disabled={isSubmitting || inviteMutation.isPending}
            >
              {isSubmitting || inviteMutation.isPending
                ? 'Envoi en cours...'
                : 'Envoyer invitation'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="text-center py-20 text-gray-400">Chargement...</div>;
  if (isError)
    return (
      <div className="text-center py-20 text-red-400">Erreur lors du chargement des données.</div>
    );

  const { kpis, topCompanies, applicationsByStatus } = data || {};

  return (
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-2">
        Tableau de bord
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          label="Étudiants actifs"
          value={kpis?.totalStudents ?? '—'}
          color="text-blue-600"
        />
        <StatCard
          label="Taux de placement"
          value={`${kpis?.placementRate ?? 0}%`}
          color="text-green-600"
        />
        <StatCard
          label="Avis publiés"
          value={kpis?.reviewsThisMonth ?? '—'}
          color="text-amber-500"
        />
        <StatCard
          label="Candidatures"
          value={kpis?.applicationsThisMonth ?? '—'}
          color="text-zinc-900"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {topCompanies?.length > 0 && (
          <div className="bg-white/60 backdrop-blur-2xl p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Top entreprises recrutant</h2>
            <div className="-ml-6">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topCompanies} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                  <XAxis
                    dataKey="_id"
                    tick={{ fontSize: 12, fill: '#71717a', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#71717a', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f4f4f5' }}
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.6)',
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)',
                      fontWeight: 'bold',
                    }}
                  />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 4, 4]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {applicationsByStatus?.length > 0 && (
          <div className="bg-white/60 backdrop-blur-2xl p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-bold text-zinc-900 mb-6">Candidatures par statut</h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-2">
              {applicationsByStatus.map((s) => (
                <div
                  key={s._id}
                  className="bg-white/50 border border-white/60 rounded-2xl p-6 shadow-sm text-center flex flex-col justify-center min-h-[120px] hover:bg-white hover:scale-105 transition-all duration-300"
                >
                  <p className="text-sm font-bold text-zinc-400 capitalize uppercase tracking-wider mb-2">
                    {s._id}
                  </p>
                  <p className="text-4xl font-black text-zinc-900">{s.count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
