import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardService } from '../../services';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';

const StatCard = ({ label, value, color = 'text-primary-600' }) => (
  <div className="card">
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
  </div>
);

export default function DashboardPage() {
  const user = useSelector(selectUser);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.get().then((r) => r.data.data),
    enabled: ['admin', 'superadmin'].includes(user?.role),
  });

  if (!['admin', 'superadmin'].includes(user?.role)) {
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
