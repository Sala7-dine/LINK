import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { companyService, dashboardService } from '../../services';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const StatCard = ({ label, value, color = 'text-primary-600' }) => (
  <div className="card">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
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
      toast.error(err.response?.data?.message || 'Erreur lors de l\'invitation partenaire');
    },
  });

  if (!['school_admin', 'super_admin'].includes(user?.role)) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
        <div className="card">
          <p className="text-gray-600 dark:text-gray-400">
            Bienvenue, <strong>{user?.name}</strong> ! Explorez les entreprises et trouvez votre stage idéal.
          </p>
        </div>
      </div>
    );
  }

  if (user?.role === 'super_admin') {
    if (isSuperLoading) return <div className="text-center py-20 text-gray-400">Chargement...</div>;
    if (isSuperError) return <div className="text-center py-20 text-red-400">Erreur lors du chargement des données.</div>;

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard Super Admin</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Ecoles actives" value={superData?.totalSchools ?? '—'} />
          <StatCard label="Utilisateurs actifs" value={superData?.totalUsers ?? '—'} />
          <StatCard label="Avis approuves" value={superData?.totalReviews ?? '—'} />
          <StatCard label="Entreprises approuvees" value={superData?.totalCompanies ?? '—'} />
        </div>

        <div className="card max-w-2xl">
          <h2 className="font-semibold mb-4">Inviter un partenaire entreprise</h2>
          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => inviteMutation.mutate(values))}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email partenaire</label>
              <input
                {...register('email', { required: true })}
                type="email"
                className="input"
                placeholder="partner@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom entreprise (optionnel)</label>
              <input
                {...register('companyName')}
                type="text"
                className="input"
                placeholder="Acme Corp"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || inviteMutation.isPending}
            >
              {isSubmitting || inviteMutation.isPending ? 'Invitation...' : 'Envoyer invitation'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) return <div className="text-center py-20 text-gray-400">Chargement...</div>;
  if (isError) return <div className="text-center py-20 text-red-400">Erreur lors du chargement des données.</div>;

  const { kpis, topCompanies, applicationsByStatus } = data || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Étudiants actifs" value={kpis?.totalStudents ?? '—'} />
        <StatCard label="Taux de placement" value={`${kpis?.placementRate ?? 0}%`} color="text-green-600" />
        <StatCard label="Avis ce mois" value={kpis?.reviewsThisMonth ?? '—'} />
        <StatCard label="Candidatures ce mois" value={kpis?.applicationsThisMonth ?? '—'} />
      </div>

      {topCompanies?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4">Top entreprises recrutant</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topCompanies} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6C63FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {applicationsByStatus?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4">Candidatures par statut</h2>
          <div className="flex flex-wrap gap-3">
            {applicationsByStatus.map((s) => (
              <div key={s._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3 text-center min-w-[120px]">
                <p className="text-xl font-bold text-primary-600">{s.count}</p>
                <p className="text-xs text-gray-500 capitalize">{s._id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
