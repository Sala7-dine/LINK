import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { authService } from '../../services';
import { setCredentials } from '../../store/slices/authSlice';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const getDashboardPathByRole = (role) => {
  if (role === 'school_admin') return '/admin/dashboard';
  if (role === 'super_admin') return '/platform/dashboard';
  if (role === 'company_admin') return '/company/applications';
  return '/student/dashboard';
};

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const { data } = await authService.login(values);
      dispatch(setCredentials(data.data));
      navigate(getDashboardPathByRole(data.data?.user?.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identifiants incorrects');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Connexion</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Accédez à votre espace LINK</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input {...register('email')} type="email" className="input" placeholder="vous@exemple.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
          <input {...register('password')} type="password" className="input" placeholder="••••••••" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">Mot de passe oublié ?</Link>
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
      <div className="mt-4 space-y-2">
        <a href="/api/v1/auth/github" className="btn-secondary w-full text-sm">Continuer avec GitHub</a>
        <a href="/api/v1/auth/google" className="btn-secondary w-full text-sm">Continuer avec Google</a>
      </div>
      <p className="mt-6 text-center text-sm text-gray-500">
        Pas encore de compte ?{' '}
        <Link to="/register-school" className="text-primary-600 font-medium hover:underline">Inscrire une ecole</Link>
      </p>
    </div>
  );
}
