import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { selectUser, setUser } from '../../store/slices/authSlice';
import { userService } from '../../services';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
      githubUrl: user?.githubUrl || '',
      linkedinUrl: user?.linkedinUrl || '',
      portfolio: user?.portfolio || '',
      promotion: user?.promotion || '',
      skills: user?.skills?.join(', ') || '',
    },
  });

  const { mutate: save } = useMutation({
    mutationFn: (data) => userService.updateMe(data),
    onSuccess: ({ data }) => {
      dispatch(setUser(data.data.user));
      toast.success('Profil mis à jour !');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const onSubmit = (values) => {
    save({ ...values, skills: values.skills.split(',').map((s) => s.trim()).filter(Boolean) });
  };

  const downloadPdf = async () => {
    try {
      const { data } = await userService.downloadProfilePdf();
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `profil-${user?.name?.replace(/\s/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Erreur lors du téléchargement');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <button onClick={downloadPdf} className="btn-secondary text-sm flex items-center gap-2">
          <DocumentArrowDownIcon className="w-4 h-4" />
          Télécharger PDF
        </button>
      </div>

      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0">
          {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-lg">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${user?.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-primary-50 text-primary-600'}`}>{user?.role}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
        <h2 className="font-semibold">Informations personnelles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
            <input {...register('name')} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Promotion</label>
            <input {...register('promotion')} className="input" placeholder="Ex: YouCode 2025" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
          <textarea {...register('bio')} className="input resize-none" rows={3} placeholder="Décrivez-vous en quelques mots..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Compétences (séparées par des virgules)</label>
          <input {...register('skills')} className="input" placeholder="React, Node.js, MongoDB, Docker..." />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub</label>
            <input {...register('githubUrl')} className="input" placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn</label>
            <input {...register('linkedinUrl')} className="input" placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio</label>
            <input {...register('portfolio')} className="input" placeholder="https://..." />
          </div>
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? 'Enregistrement...' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
}
