import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services';

const schema = z.object({
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string().min(8, 'Confirmation requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    if (!token) {
      toast.error('Lien invalide');
      return;
    }
    try {
      await authService.resetPassword(token, { password: values.password });
      toast.success('Mot de passe défini avec succès. Vous pouvez vous connecter.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lien invalide ou expiré');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-medium mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Sécurité du compte
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Nouveau mot de passe</h1>
        <p className="text-zinc-500">Choisissez un nouveau mot de passe sécurisé pour activer votre compte.</p>
      </div>

      {/* Security hint */}
      <div className="mb-6 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
        <p className="text-xs text-zinc-500 flex items-start gap-2">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Votre mot de passe doit contenir au minimum 8 caractères. Utilisez un mélange de lettres, chiffres et symboles pour plus de sécurité.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nouveau mot de passe</label>
          <input {...register('password')} type="password" className={inputClass} placeholder="Minimum 8 caractères" />
          {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Confirmer le mot de passe</label>
          <input {...register('confirmPassword')} type="password" className={inputClass} placeholder="Retapez le mot de passe" />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full bg-zinc-900 text-white font-semibold py-3 px-6 rounded-xl overflow-hidden transition-transform hover:-translate-y-0.5 shadow-lg shadow-zinc-900/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          <span className="relative z-10">{isSubmitting ? 'Validation...' : 'Valider le mot de passe'}</span>
          <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rotate-45 translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
          <svg className="absolute top-2 right-2 w-4 h-4 text-zinc-900 z-20 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Retour à la{' '}
        <Link to="/login" className="text-green-600 font-semibold hover:text-green-700 transition-colors">
          connexion
        </Link>
      </p>
    </div>
  );
}
