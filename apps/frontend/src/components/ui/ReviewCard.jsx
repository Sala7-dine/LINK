import { StarIcon, HandThumbUpIcon, FlagIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../../services';
import { toast } from 'react-toastify';

const Stars = ({ value }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <StarIcon key={i} className={`w-4 h-4 ${i <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ))}
  </div>
);

const ENV_LABELS = { legacy: 'Legacy', mixed: 'Mixte', modern: 'Modern' };

export default function ReviewCard({ review }) {
  const queryClient = useQueryClient();

  const { mutate: like } = useMutation({
    mutationFn: () => reviewService.like(review._id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
    onError: () => toast.error('Erreur'),
  });

  const { mutate: flag } = useMutation({
    mutationFn: () => reviewService.flag(review._id),
    onSuccess: () => toast.info('Avis signalé'),
    onError: () => toast.error('Erreur'),
  });

  const author = review.isAnonymous ? 'Anonyme' : review.author?.name;
  const date = new Date(review.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Stars value={review.globalRating} />
            <span className="text-sm font-medium">{review.globalRating}/5</span>
          </div>
          {review.title && <p className="font-semibold mt-1">{review.title}</p>}
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>{author}</p>
          <p>{date}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {review.techEnvironment && (
          <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-0.5 rounded-full">
            Env: {ENV_LABELS[review.techEnvironment]}
          </span>
        )}
        {review.isPaid !== undefined && (
          <span className={`px-2 py-0.5 rounded-full ${review.isPaid ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
            {review.isPaid ? `Rémunéré ${review.salary ? '· ' + review.salary + '€' : ''}` : 'Non rémunéré'}
          </span>
        )}
        {review.duration && <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">{review.duration}</span>}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{review.content}</p>

      {(review.pros || review.cons) && (
        <div className="grid grid-cols-2 gap-3 text-xs">
          {review.pros && <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-2"><span className="font-medium text-green-700 dark:text-green-400">+ Avantages</span><p className="text-gray-600 dark:text-gray-400 mt-1">{review.pros}</p></div>}
          {review.cons && <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-2"><span className="font-medium text-red-600">- Inconvénients</span><p className="text-gray-600 dark:text-gray-400 mt-1">{review.cons}</p></div>}
        </div>
      )}

      <div className="flex items-center gap-4 pt-1 border-t border-gray-100 dark:border-gray-700">
        <button onClick={() => like()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
          <HandThumbUpIcon className="w-4 h-4" />
          <span>{review.likesCount || 0}</span>
        </button>
        <button onClick={() => flag()} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors ml-auto">
          <FlagIcon className="w-4 h-4" />
          Signaler
        </button>
      </div>
    </div>
  );
}
