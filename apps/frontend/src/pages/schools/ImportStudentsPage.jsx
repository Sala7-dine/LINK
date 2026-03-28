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
      toast.error(err.response?.data?.message || "Erreur lors de l'import CSV");
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
      toast.error(err.response?.data?.message || "Erreur lors de l'invitation");
    } finally {
      setIsInviteSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-2">
          Import des étudiants
        </h1>
        <p className="text-lg text-zinc-500">
          Ajoutez de nouveaux étudiants manuellement ou importez-les en masse.
        </p>
      </div>

      <div className="bg-white/60 backdrop-blur-2xl p-6 rounded-[24px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-3">
        <p className="text-sm font-bold text-zinc-900">Format attendu pour l'import CSV</p>
        <pre className="text-xs font-mono bg-zinc-900 text-green-400 rounded-xl p-4 overflow-x-auto shadow-inner border border-zinc-800">
          name,email,promotion John Doe,john@school.ma,YouCode 2026 Jane Doe,jane@school.ma,YouCode
          2026
        </pre>
      </div>

      <form
        onSubmit={onInviteSubmit}
        className="bg-white/60 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <h2 className="text-xl font-bold text-zinc-900 mb-6 relative z-10">Invitation manuelle</h2>

        {needsManualSchoolId && (
          <div className="relative z-10">
            <label className="block text-sm font-bold text-zinc-700 mb-2">School ID</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner"
              value={manualSchoolId}
              onChange={(e) => setManualSchoolId(e.target.value)}
              placeholder="Entrez l'identifiant de l'école"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">Nom</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Nom complet"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-zinc-700 mb-2">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="etudiant@school.ma"
            />
          </div>
        </div>

        <div className="relative z-10">
          <label className="block text-sm font-bold text-zinc-700 mb-2">Promotion</label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner"
            value={studentPromotion}
            onChange={(e) => setStudentPromotion(e.target.value)}
            placeholder="Ex: YouCode 2026"
          />
        </div>

        <button
          type="submit"
          disabled={isInviteSubmitting}
          className="w-full sm:w-auto bg-zinc-900 text-white font-bold py-3 px-8 rounded-xl hover:-translate-y-0.5 shadow-lg shadow-zinc-900/20 active:scale-95 transition-all text-sm mt-2 relative z-10"
        >
          {isInviteSubmitting ? 'Invitation en cours...' : 'Inviter un étudiant'}
        </button>
      </form>

      <form
        onSubmit={onSubmit}
        className="bg-white/60 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <h2 className="text-xl font-bold text-zinc-900 mb-6 relative z-10">
          Import en masse (CSV)
        </h2>
        {needsManualSchoolId && (
          <div className="relative z-10">
            <label className="block text-sm font-bold text-zinc-700 mb-2">School ID</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner"
              value={manualSchoolId}
              onChange={(e) => setManualSchoolId(e.target.value)}
              placeholder="Entrez l'identifiant de l'école"
            />
          </div>
        )}

        <div className="relative z-10">
          <label className="block text-sm font-bold text-zinc-700 mb-2">Fichier CSV</label>
          <input
            id="students-csv-input"
            type="file"
            accept=".csv,text/csv"
            className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-zinc-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-zinc-900 shadow-inner file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <button
          type="submit"
          disabled={isCsvSubmitting}
          className="w-full sm:w-auto bg-zinc-900 text-white font-bold py-3 px-8 rounded-xl hover:-translate-y-0.5 shadow-lg shadow-zinc-900/20 active:scale-95 transition-all text-sm mt-2 relative z-10"
        >
          {isCsvSubmitting ? 'Import en cours...' : 'Importer les étudiants'}
        </button>
      </form>
    </div>
  );
}
