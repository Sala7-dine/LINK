import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { authService } from '../../services';
import { setCredentials } from '../../store/slices/authSlice';

const schema = z.object({
  schoolName: z.string().min(2, 'Nom de l\'ecole requis'),
  adminName: z.string().min(2, 'Nom administrateur requis'),
  adminEmail: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caracteres'),
});

export default function RegisterSchoolPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await authService.registerSchool(values);
      dispatch(setCredentials(data.data));
      toast.success('Ecole creee avec succes');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la creation du tenant');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Inscrire une ecole</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Creer votre tenant LINK et votre compte administrateur</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'ecole</label>
          <input {...register('schoolName')} type="text" className="input" placeholder="Ex: YouCode Marrakech" />
          {errors.schoolName && <p className="text-red-500 text-xs mt-1">{errors.schoolName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom administrateur</label>
          <input {...register('adminName')} type="text" className="input" placeholder="Nom complet" />
          {errors.adminName && <p className="text-red-500 text-xs mt-1">{errors.adminName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email administrateur</label>
          <input {...register('adminEmail')} type="email" className="input" placeholder="admin@ecole.ma" />
          {errors.adminEmail && <p className="text-red-500 text-xs mt-1">{errors.adminEmail.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
          <input {...register('password')} type="password" className="input" placeholder="Minimum 8 caracteres" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? 'Creation...' : 'Creer mon ecole'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Vous avez deja un compte ?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">Se connecter</Link>
      </p>
    </div>
  );
}
