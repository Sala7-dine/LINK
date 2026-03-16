import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { selectUser, setUser } from '../../store/slices/authSlice';
import { experienceService, userService } from '../../services';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const EXPERIENCE_TYPES = [
  { value: 'first_year_internship', label: 'Stage 1ere annee' },
  { value: 'second_year_internship', label: 'Stage 2eme annee' },
  { value: 'second_year_cdi', label: 'CDI 2eme annee' },
];

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};

export default function ProfilePage() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [showExperienceForm, setShowExperienceForm] = useState(false);

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

  const {
    register: registerExperience,
    handleSubmit: handleExperienceSubmit,
    reset: resetExperienceForm,
    formState: { isSubmitting: isCreatingExperience },
  } = useForm({
    defaultValues: {
      companyName: '',
      experienceType: 'first_year_internship',
      startDate: '',
      endDate: '',
      location: '',
      description: '',
      technologies: '',
      companyLinkedinUrl: '',
      companyWebsiteUrl: '',
    },
  });

  const { data: myExperiences } = useQuery({
    queryKey: ['my-experiences'],
    queryFn: () => experienceService.getMine().then((r) => r.data.data.experiences),
  });

  const { mutate: save } = useMutation({
    mutationFn: (data) => userService.updateMe(data),
    onSuccess: ({ data }) => {
      dispatch(setUser(data.data.user));
      toast.success('Profil mis à jour !');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const { mutate: createExperience } = useMutation({
    mutationFn: (payload) => experienceService.create(payload),
    onSuccess: () => {
      toast.success('Experience ajoutee avec succes !');
      resetExperienceForm();
      setShowExperienceForm(false);
      queryClient.invalidateQueries({ queryKey: ['my-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
    onError: () => toast.error("Impossible d'ajouter l'experience"),
  });

  const onSubmit = (values) => {
    save({ ...values, skills: values.skills.split(',').map((s) => s.trim()).filter(Boolean) });
  };

  const onSubmitExperience = (values) => {
    const technologies = values.technologies
      ? values.technologies.split(',').map((item) => item.trim()).filter(Boolean)
      : [];
    createExperience({ ...values, technologies });
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
          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block capitalize ${user?.role === 'school_admin' ? 'bg-orange-100 text-orange-600' : 'bg-primary-50 text-primary-600'}`}>{user?.role}</span>
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

      {user?.role === 'student' && (
        <section className="space-y-4">
          <div className="card flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">Mes experiences</h2>
              <p className="text-sm text-gray-500">Partagez vos experiences pour aider les autres etudiants.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowExperienceForm((prev) => !prev)}
              className="btn-primary"
            >
              {showExperienceForm ? 'Annuler' : 'Ajouter une experience'}
            </button>
          </div>

          {showExperienceForm && (
            <form onSubmit={handleExperienceSubmit(onSubmitExperience)} className="card space-y-4">
              <h3 className="font-semibold">Nouvelle experience</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                  <input {...registerExperience('companyName', { required: true })} className="input" placeholder="Ex: Capgemini" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select {...registerExperience('experienceType', { required: true })} className="input">
                    {EXPERIENCE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date debut</label>
                  <input type="date" {...registerExperience('startDate', { required: true })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input type="date" {...registerExperience('endDate', { required: true })} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
                  <input {...registerExperience('location', { required: true })} className="input" placeholder="Casablanca" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  {...registerExperience('description')}
                  className="input resize-none"
                  rows={4}
                  placeholder="Resume votre experience, vos missions et ce que vous avez appris..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technologies (separees par des virgules)</label>
                <input
                  {...registerExperience('technologies')}
                  className="input"
                  placeholder="React, Node.js, Docker"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn entreprise</label>
                  <input {...registerExperience('companyLinkedinUrl')} className="input" placeholder="https://linkedin.com/company/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site web entreprise</label>
                  <input {...registerExperience('companyWebsiteUrl')} className="input" placeholder="https://..." />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isCreatingExperience}>
                {isCreatingExperience ? 'Publication...' : 'Publier'}
              </button>
            </form>
          )}

          <div className="space-y-3">
            {(myExperiences || []).length === 0 && (
              <div className="card text-sm text-gray-500">Aucune experience partagee pour le moment.</div>
            )}

            {(myExperiences || []).map((experience) => (
              <article key={experience._id} className="card space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{experience.companyName}</h3>
                  <span className="text-xs text-gray-500">
                    {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{experience.location}</p>
                {experience.description && <p className="text-sm text-gray-600">{experience.description}</p>}
                {Array.isArray(experience.technologies) && experience.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {experience.technologies.map((tech) => (
                      <span key={tech} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
