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
  const [isCsvSubmitting, setIsCsvSubmitting] = useState(false);
  const [isInviteSubmitting, setIsInviteSubmitting] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPromotion, setStudentPromotion] = useState('');

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
      setIsCsvSubmitting(true);
      const { data } = await schoolService.importStudents(schoolId, formData);
      toast.success(data?.message || 'Import termine avec succes');
      setFile(null);
      const input = document.getElementById('students-csv-input');
      if (input) input.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'import CSV');
    } finally {
      setIsCsvSubmitting(false);
    }
  };

  const onInviteSubmit = async (e) => {
    e.preventDefault();

    if (!schoolId) {
      toast.error('School ID requis pour inviter un etudiant');
      return;
    }

    if (!studentName.trim() || !studentEmail.trim()) {
      toast.error('Nom et email sont obligatoires');
      return;
    }

    try {
      setIsInviteSubmitting(true);
      const { data } = await schoolService.inviteStudent(schoolId, {
        name: studentName.trim(),
        email: studentEmail.trim(),
        promotion: studentPromotion.trim(),
      });
      toast.success(data?.message || 'Invitation envoyee');
      setStudentName('');
      setStudentEmail('');
      setStudentPromotion('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'invitation');
    } finally {
      setIsInviteSubmitting(false);
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

      <form onSubmit={onInviteSubmit} className="card space-y-4">
        <h2 className="text-lg font-semibold">Invitation manuelle</h2>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
            <input
              type="text"
              className="input"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Nom complet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              className="input"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="etudiant@school.ma"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Promotion</label>
          <input
            type="text"
            className="input"
            value={studentPromotion}
            onChange={(e) => setStudentPromotion(e.target.value)}
            placeholder="Ex: YouCode 2026"
          />
        </div>

        <button type="submit" disabled={isInviteSubmitting} className="btn-primary">
          {isInviteSubmitting ? 'Invitation en cours...' : 'Inviter un etudiant'}
        </button>
      </form>

      <form onSubmit={onSubmit} className="card space-y-4">
        <h2 className="text-lg font-semibold">Import en masse (CSV)</h2>
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

        <button type="submit" disabled={isCsvSubmitting} className="btn-primary">
          {isCsvSubmitting ? 'Import en cours...' : 'Importer les etudiants'}
        </button>
      </form>
    </div>
  );
}
