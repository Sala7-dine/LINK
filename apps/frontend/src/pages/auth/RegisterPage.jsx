import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { authService } from '../../services';
import { setCredentials } from '../../store/slices/authSlice';

const schema = z.object({
  name: z.string().min(2, 'Nom requis (min 2 caractères)'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const { data } = await authService.register(values);
      dispatch(setCredentials(data.data));
      toast.success('Bienvenue ! Vérifiez votre email.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Créer un compte</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Rejoignez la communauté LINK</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nom complet
          </label>
          <input {...register('name')} type="text" className="input" placeholder="Votre nom" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            className="input"
            placeholder="vous@exemple.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mot de passe
          </label>
          <input
            {...register('password')}
            type="password"
            className="input"
            placeholder="Min. 8 caractères"
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Création...' : 'Créer mon compte'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
