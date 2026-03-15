import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services';

const schema = z.object({
  password: z.string().min(8, 'Minimum 8 caracteres'),
  confirmPassword: z.string().min(8, 'Confirmation requise'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

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
      toast.success('Mot de passe defini avec succes. Vous pouvez vous connecter.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lien invalide ou expire');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Definir un mot de passe</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Choisissez un nouveau mot de passe pour activer votre compte.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
          <input {...register('password')} type="password" className="input" placeholder="Minimum 8 caracteres" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer le mot de passe</label>
          <input {...register('confirmPassword')} type="password" className="input" placeholder="Retapez le mot de passe" />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Validation...' : 'Valider le mot de passe'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Retour a la{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">connexion</Link>
      </p>
    </div>
  );
}
