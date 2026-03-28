import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { authService } from '../../services';
import { setCredentials } from '../../store/slices/authSlice';

const schema = z.object({
  schoolName: z.string().min(2, "Nom de l'école requis"),
  adminName: z.string().min(2, 'Nom administrateur requis'),
  adminEmail: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

/* ─── Styled field ─────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
    </div>
  );
}

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all';

export default function RegisterSchoolPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await authService.registerSchool(values);
      dispatch(setCredentials(data.data));
      toast.success('École créée avec succès');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la création');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-medium mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Créer votre espace LINK
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Inscrire une école</h1>
        <p className="text-zinc-500">Créez votre tenant LINK et votre compte administrateur.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field label="Nom de l'école" error={errors.schoolName?.message}>
          <input
            {...register('schoolName')}
            type="text"
            className={inputClass}
            placeholder="Ex: YouCode Marrakech"
          />
        </Field>

        <Field label="Nom administrateur" error={errors.adminName?.message}>
          <input
            {...register('adminName')}
            type="text"
            className={inputClass}
            placeholder="Nom complet"
          />
        </Field>

        <Field label="Email administrateur" error={errors.adminEmail?.message}>
          <input
            {...register('adminEmail')}
            type="email"
            className={inputClass}
            placeholder="admin@ecole.ma"
          />
        </Field>

        <Field label="Mot de passe" error={errors.password?.message}>
          <input
            {...register('password')}
            type="password"
            className={inputClass}
            placeholder="Minimum 8 caractères"
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full bg-zinc-900 text-white font-semibold py-3 px-6 rounded-xl overflow-hidden transition-transform hover:-translate-y-0.5 shadow-lg shadow-zinc-900/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="relative z-10">{isSubmitting ? 'Création...' : 'Créer mon école'}</span>
          <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rotate-45 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
          <svg
            className="absolute top-2 right-2 w-4 h-4 text-zinc-900 z-20 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M7 17L17 7M17 7H7M17 7V17"
            />
          </svg>
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Vous avez déjà un compte ?{' '}
        <Link
          to="/login"
          className="text-green-600 font-semibold hover:text-green-700 transition-colors"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
