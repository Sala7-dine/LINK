import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectUser } from '../../store/slices/authSlice';
import { userService } from '../../services';

const roleOptionsByEditorRole = {
  school_admin: ['student', 'school_admin'],
  super_admin: ['student', 'school_admin', 'super_admin'],
};

export default function UsersManagementPage() {
  const currentUser = useSelector(selectUser);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const allowedTargetRoles = useMemo(
    () => roleOptionsByEditorRole[currentUser?.role] || ['student'],
    [currentUser?.role]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['users-management', search, roleFilter],
    queryFn: () => userService.getAll({ search: search || undefined, role: roleFilter || undefined }).then((r) => r.data),
    enabled: ['school_admin', 'super_admin'].includes(currentUser?.role),
  });

  const { mutate: changeRole, isPending: isChangingRole } = useMutation({
    mutationFn: ({ id, role }) => userService.updateRole(id, role),
    onSuccess: () => {
      toast.success('Role mis a jour');
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors du changement de role'),
  });

  const { mutate: toggleActive, isPending: isTogglingActive } = useMutation({
    mutationFn: ({ id, isActive }) => userService.setActiveStatus(id, isActive),
    onSuccess: (_, vars) => {
      toast.success(vars.isActive ? 'Utilisateur reactive' : 'Utilisateur suspendu');
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur lors de la mise a jour du statut'),
  });

  const users = data?.data?.users || [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-2">Gestion des utilisateurs</h1>
        <p className="text-lg text-zinc-500">Gérez les rôles et statuts des utilisateurs de votre école.</p>
      </div>

      <div className="bg-white/60 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner md:col-span-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email"
        />
        <select 
          className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner appearance-none" 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Tous les rôles</option>
          <option value="student">Étudiant</option>
          <option value="school_admin">School Admin</option>
          {currentUser?.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
        </select>
      </div>

      <div className="bg-white/60 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-x-auto relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        {isLoading ? (
          <p className="text-zinc-500 py-8 text-center animate-pulse font-medium">Chargement en cours...</p>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap relative z-10">
            <thead>
              <tr className="border-b border-zinc-200/60 text-zinc-900">
                <th className="py-4 font-bold text-sm">Nom</th>
                <th className="py-4 font-bold text-sm">Email</th>
                <th className="py-4 font-bold text-sm">Rôle</th>
                <th className="py-4 font-bold text-sm">Statut</th>
                <th className="py-4 font-bold text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const canEdit = user._id !== currentUser?._id;
                const canEditSuperAdmin = currentUser?.role === 'super_admin';
                const isSuperAdminUser = user.role === 'super_admin';
                const canEditThisUser = canEdit && (!isSuperAdminUser || canEditSuperAdmin);

                return (
                  <tr key={user._id} className="border-b border-zinc-100/50 hover:bg-white/50 transition-colors group">
                    <td className="py-4 pr-4 font-bold text-zinc-800">{user.name || <span className="text-zinc-400 font-medium italic">Anonyme</span>}</td>
                    <td className="py-4 pr-4 font-medium text-zinc-600">{user.email}</td>
                    <td className="py-4 pr-4">
                      <select
                        className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-colors cursor-pointer appearance-none bg-white shadow-sm focus:ring-2 focus:outline-none focus:border-green-500
                        ${!canEditThisUser || isChangingRole ? 'border-zinc-200 text-zinc-400 bg-zinc-50/50 cursor-not-allowed' : 'border-zinc-200 text-zinc-700 hover:border-zinc-300'}`}
                        value={user.role}
                        disabled={!canEditThisUser || isChangingRole}
                        onChange={(e) => changeRole({ id: user._id, role: e.target.value })}
                      >
                        {allowedTargetRoles.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider inline-block shadow-sm border
                        ${user.isActive ? 'bg-green-100 text-green-700 border-green-200/50' : 'bg-red-100 text-red-700 border-red-200/50'}`}>
                        {user.isActive ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm border
                         ${!canEditThisUser || isTogglingActive ? 'bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed' : 
                         user.isActive ? 'bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 active:scale-95' : 
                         'bg-white text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 active:scale-95'}`}
                        disabled={!canEditThisUser || isTogglingActive}
                        onClick={() => toggleActive({ id: user._id, isActive: !user.isActive })}
                      >
                        {user.isActive ? 'Suspendre' : 'Réactiver'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td className="py-12 text-center text-zinc-500 font-medium" colSpan={5}>Aucun utilisateur trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
