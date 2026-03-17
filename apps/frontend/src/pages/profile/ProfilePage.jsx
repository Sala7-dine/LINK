import { useState, useRef, useEffect } from 'react';
import PageHero from '../../components/common/PageHero';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { selectUser, setUser } from '../../store/slices/authSlice';
import { experienceService, userService } from '../../services';
import { DocumentArrowDownIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';

const EXPERIENCE_TYPES = [
  { value: 'first_year_internship', label: 'Stage 1ère année' },
  { value: 'second_year_internship', label: 'Stage 2ème année' },
  { value: 'second_year_cdi', label: 'CDI 2ème année' },
];

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};

function useRevealOnScroll() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    const els = document.querySelectorAll('.reveal-on-scroll');
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function ProfilePage() {
  const user = useSelector(selectUser);
  const isStudent = user?.role === 'student';
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  useRevealOnScroll();

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
      toast.success('Profil mis à jour avec succès !');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const { mutate: createExperience } = useMutation({
    mutationFn: (payload) => experienceService.create(payload),
    onSuccess: () => {
      toast.success('Expérience ajoutée avec succès !');
      resetExperienceForm();
      setShowExperienceForm(false);
      queryClient.invalidateQueries({ queryKey: ['my-experiences'] });
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
    onError: () => toast.error("Impossible d'ajouter l'expérience"),
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

  // Base input class for the forms
  const inputClassName = "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm placeholder:text-zinc-400 font-medium text-zinc-900";
  const labelClassName = "block text-sm font-bold text-zinc-700 mb-1.5";

  return (
    <>
      {isStudent && (
        <PageHero 
          title="Mon profil" 
          description="Gérez vos informations personnelles et votre parcours de stage."
          bgImage="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2000"
        >
          <button 
            onClick={downloadPdf} 
            className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold py-2.5 px-6 rounded-xl hover:bg-white/20 transition-all shadow-lg"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            <span>Exporter (CV PDF)</span>
          </button>
        </PageHero>
      )}
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">

      {/* User Identity Card */}
      <div className="bg-white p-8 rounded-[24px] border border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] reveal-on-scroll flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        {/* Background Blob decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-100/50 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-24 h-24 rounded-bl-[24px] rounded-[10px] sm:rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden flex-shrink-0 shadow-lg shadow-green-500/30 z-10">
          {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user?.name?.[0]?.toUpperCase()}
        </div>
        
        <div className="text-center sm:text-left z-10 mt-2">
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">{user?.name}</h2>
          <p className="text-zinc-500 font-medium mb-3">{user?.email}</p>
          <div className="inline-flex">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize tracking-wide ${user?.role === 'school_admin' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
              Rôle : {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 sm:p-10 rounded-[24px] border border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] reveal-on-scroll space-y-6">
        <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100">
            <PencilSquareIcon className="w-5 h-5 text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Informations publiques</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelClassName}>Nom complet</label>
            <input {...register('name')} className={inputClassName} />
          </div>
          <div>
            <label className={labelClassName}>Promotion</label>
            <input {...register('promotion')} className={inputClassName} placeholder="Ex: YouCode 2025" />
          </div>
        </div>
        
        <div>
          <label className={labelClassName}>Bio</label>
          <textarea {...register('bio')} className={`${inputClassName} resize-none`} rows={4} placeholder="Décrivez-vous en quelques mots..." />
        </div>
        
        <div>
          <label className={labelClassName}>Compétences clés</label>
          <input {...register('skills')} className={inputClassName} placeholder="Ex: React, Node.js, MongoDB, Docker... (séparer par des virgules)" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className={labelClassName}>GitHub (URL)</label>
            <input {...register('githubUrl')} className={inputClassName} placeholder="https://github.com/..." />
          </div>
          <div>
            <label className={labelClassName}>LinkedIn (URL)</label>
            <input {...register('linkedinUrl')} className={inputClassName} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className={labelClassName}>Portfolio Web</label>
            <input {...register('portfolio')} className={inputClassName} placeholder="https://..." />
          </div>
        </div>
        
        <div className="pt-6 border-t border-zinc-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="group relative bg-zinc-900 text-white font-semibold py-3 px-8 rounded-xl overflow-hidden shadow-lg shadow-zinc-900/20 active:scale-95 transition-all w-full sm:w-auto"
          >
            <span className="relative z-10 transition-colors uppercase tracking-wider text-xs">{isSubmitting ? 'Enregistrement...' : 'Mettre à jour le profil'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </form>

      {/* Experience Section (Students Only) */}
      {user?.role === 'student' && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Mon parcours</h2>
              <p className="text-zinc-500 mt-1">Gérez vos stages et emplois et partagez-les avec le réseau.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowExperienceForm((prev) => !prev)}
              className="flex items-center justify-center gap-2 bg-green-50 text-green-700 font-bold py-3 px-6 rounded-xl hover:bg-green-100 border border-green-200 transition-all shadow-sm w-full sm:w-auto"
            >
              <PlusIcon className={`w-5 h-5 transition-transform duration-300 ${showExperienceForm ? 'rotate-45' : ''}`} />
              {showExperienceForm ? 'Fermer le formulaire' : 'Ajouter une expérience'}
            </button>
          </div>

          {/* New Experience Form */}
          {showExperienceForm && (
            <form onSubmit={handleExperienceSubmit(onSubmitExperience)} className="bg-white p-6 sm:p-10 rounded-[24px] border border-green-200 shadow-[0_10px_30px_-5px_rgba(34,197,94,0.15)] ring-4 ring-green-50/50 reveal-on-scroll space-y-6 mb-8 relative">
              <div className="absolute top-0 right-0 p-6">
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Nouveau</span>
              </div>
              
              <h3 className="text-xl font-bold text-zinc-900 mb-6">Détails de l'expérience</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClassName}>Nom de l'entreprise</label>
                  <input {...registerExperience('companyName', { required: true })} className={inputClassName} placeholder="Ex: Capgemini, Orange..." />
                </div>
                <div>
                  <label className={labelClassName}>Type de contrat</label>
                  <select {...registerExperience('experienceType', { required: true })} className={inputClassName}>
                    {EXPERIENCE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className={labelClassName}>Date de début</label>
                  <input type="date" {...registerExperience('startDate', { required: true })} className={inputClassName} />
                </div>
                <div>
                  <label className={labelClassName}>Date de fin</label>
                  <input type="date" {...registerExperience('endDate', { required: true })} className={inputClassName} />
                </div>
                <div>
                  <label className={labelClassName}>Lieu (Ville / Remote)</label>
                  <input {...registerExperience('location', { required: true })} className={inputClassName} placeholder="Ex: Casablanca" />
                </div>
              </div>

              <div>
                <label className={labelClassName}>Description détaillée</label>
                <textarea
                  {...registerExperience('description')}
                  className={`${inputClassName} resize-none`}
                  rows={4}
                  placeholder="Décrivez les missions réalisées, le contexte du projet, et les compétences acquises..."
                />
              </div>

              <div>
                <label className={labelClassName}>Technologies utilisées</label>
                <input
                  {...registerExperience('technologies')}
                  className={inputClassName}
                  placeholder="Ex: React, Node.js, Docker (séparées par des virgules)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelClassName}>Lien LinkedIn de l'entreprise (Optionnel)</label>
                  <input {...registerExperience('companyLinkedinUrl')} className={inputClassName} placeholder="https://linkedin.com/company/..." />
                </div>
                <div>
                  <label className={labelClassName}>Site web de l'entreprise (Optionnel)</label>
                  <input {...registerExperience('companyWebsiteUrl')} className={inputClassName} placeholder="https://..." />
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-100 flex justify-end">
                <button type="submit" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all uppercase tracking-widest text-xs" disabled={isCreatingExperience}>
                  {isCreatingExperience ? 'Publication...' : 'Publier ce retour d\'expérience'}
                </button>
              </div>
            </form>
          )}

          {/* List of User's Experiences */}
          <div className="space-y-4">
            {(myExperiences || []).length === 0 && !showExperienceForm && (
              <div className="bg-white/50 backdrop-blur-md border border-zinc-200 rounded-3xl p-12 text-center shadow-sm">
                <p className="text-zinc-500 text-lg">Vous n'avez pas encore partagé d'expérience.</p>
                <p className="text-zinc-400 mt-2">Enrichissez votre CV en ajoutant vos stages récents.</p>
              </div>
            )}

            {(myExperiences || []).map((experience, i) => (
              <article 
                key={experience._id} 
                className="bg-white p-6 sm:p-8 rounded-[24px] border border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] transition-all reveal-on-scroll relative overflow-hidden group"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 leading-tight mb-1">{experience.companyName}</h3>
                    <p className="text-sm font-semibold text-zinc-500 flex items-center gap-2">
                      <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-wider text-[10px]">
                        {EXPERIENCE_TYPES.find(t => t.value === experience.experienceType)?.label || experience.experienceType}
                      </span>
                      • {experience.location}
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-zinc-100 text-zinc-600 px-3 py-1.5 rounded-full whitespace-nowrap">
                    {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
                  </span>
                </div>
                
                {experience.description && (
                  <p className="text-zinc-600 leading-relaxed text-sm mb-4">{experience.description}</p>
                )}
                
                {Array.isArray(experience.technologies) && experience.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {experience.technologies.map((tech) => (
                      <span key={tech} className="text-[11px] px-2.5 py-1 rounded-lg border border-zinc-200 text-zinc-700 font-bold uppercase tracking-wider bg-zinc-50">
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
    </>
  );
}
