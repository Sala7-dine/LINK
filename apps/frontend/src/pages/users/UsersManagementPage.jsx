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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerez les roles et statuts des utilisateurs de votre ecole.</p>
      </div>

      <div className="card grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          className="input md:col-span-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email"
        />
        <select className="input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">Tous les roles</option>
          <option value="student">student</option>
          <option value="school_admin">school_admin</option>
          {currentUser?.role === 'super_admin' && <option value="super_admin">super_admin</option>}
        </select>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <p className="text-gray-500">Chargement...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                <th className="py-3">Nom</th>
                <th className="py-3">Email</th>
                <th className="py-3">Role</th>
                <th className="py-3">Statut</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const canEdit = user._id !== currentUser?._id;
                const canEditSuperAdmin = currentUser?.role === 'super_admin';
                const isSuperAdminUser = user.role === 'super_admin';
                const canEditThisUser = canEdit && (!isSuperAdminUser || canEditSuperAdmin);

                return (
                  <tr key={user._id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 pr-3">{user.name || '-'}</td>
                    <td className="py-3 pr-3">{user.email}</td>
                    <td className="py-3 pr-3">
                      <select
                        className="input"
                        value={user.role}
                        disabled={!canEditThisUser || isChangingRole}
                        onChange={(e) => changeRole({ id: user._id, role: e.target.value })}
                      >
                        {allowedTargetRoles.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        className="btn-secondary"
                        disabled={!canEditThisUser || isTogglingActive}
                        onClick={() => toggleActive({ id: user._id, isActive: !user.isActive })}
                      >
                        {user.isActive ? 'Suspendre' : 'Reactiver'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td className="py-6 text-center text-gray-500" colSpan={5}>Aucun utilisateur trouve.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
