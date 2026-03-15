import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectUser } from '../../store/slices/authSlice';
import { schoolService } from '../../services';

const resolveSchoolIdFromUser = (user) => {
  if (!user) return '';
  if (typeof user.tenantId === 'string') return user.tenantId;
  if (user.tenantId?._id) return user.tenantId._id;
  if (typeof user.school === 'string') return user.school;
  if (user.school?._id) return user.school._id;
  return '';
};

export default function ImportStudentsPage() {
  const user = useSelector(selectUser);
  const inferredSchoolId = useMemo(() => resolveSchoolIdFromUser(user), [user]);

  const [manualSchoolId, setManualSchoolId] = useState('');
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schoolId = inferredSchoolId || manualSchoolId.trim();
  const needsManualSchoolId = !inferredSchoolId && user?.role === 'super_admin';

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!schoolId) {
      toast.error('School ID requis pour importer des etudiants');
      return;
    }

    if (!file) {
      toast.error('Veuillez selectionner un fichier CSV');
      return;
    }

    const formData = new FormData();
    formData.append('csv', file);

    try {
      setIsSubmitting(true);
      const { data } = await schoolService.importStudents(schoolId, formData);
      toast.success(data?.message || 'Import termine avec succes');
      setFile(null);
      const input = document.getElementById('students-csv-input');
      if (input) input.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'import CSV');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import des etudiants</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Importez un fichier CSV avec le format: nom,email,promotion
        </p>
      </div>

      <div className="card space-y-3">
        <p className="text-sm font-semibold">Format attendu</p>
        <pre className="text-xs bg-gray-50 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto">name,email,promotion\nJohn Doe,john@school.ma,YouCode 2026\nJane Doe,jane@school.ma,YouCode 2026</pre>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4">
        {needsManualSchoolId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School ID</label>
            <input
              type="text"
              className="input"
              value={manualSchoolId}
              onChange={(e) => setManualSchoolId(e.target.value)}
              placeholder="Entrez l'identifiant de l'ecole"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fichier CSV</label>
          <input
            id="students-csv-input"
            type="file"
            accept=".csv,text/csv"
            className="input"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Import en cours...' : 'Importer les etudiants'}
        </button>
      </form>
    </div>
  );
}
