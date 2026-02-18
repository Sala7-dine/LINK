import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { offerService } from '../../services';
import { toast } from 'react-toastify';

const COLUMNS = [
  { id: 'interested', label: 'Intéressé', color: 'bg-blue-500' },
  { id: 'applied', label: 'Postulé', color: 'bg-yellow-500' },
  { id: 'interview', label: 'Entretien', color: 'bg-purple-500' },
  { id: 'accepted', label: 'Accepté', color: 'bg-green-500' },
  { id: 'rejected', label: 'Refusé', color: 'bg-red-400' },
];

export default function KanbanPage() {
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: () => offerService.getMyApplications().then((r) => r.data.data.applications),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => offerService.updateApplication(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications', 'me'] }),
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    updateStatus({ id: draggableId, status: destination.droppableId });
  };

  const byStatus = (status) => applications.filter((a) => a.status === status);

  if (isLoading) return <div className="text-center py-20 text-gray-400">Chargement...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Mes candidatures</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex-shrink-0 w-64">
              <div className={`flex items-center gap-2 mb-3`}>
                <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <span className="font-medium text-sm">{col.label}</span>
                <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">{byStatus(col.id).length}</span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] rounded-xl p-2 space-y-2 transition-colors ${snapshot.isDraggingOver ? 'bg-primary-50 dark:bg-primary-900/10' : 'bg-gray-100 dark:bg-gray-800'}`}
                  >
                    {byStatus(col.id).map((app, index) => (
                      <Draggable key={app._id} draggableId={app._id} index={index}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing ${snap.isDragging ? 'shadow-lg ring-1 ring-primary-400' : ''}`}
                          >
                            <p className="font-medium text-sm text-gray-900 dark:text-white leading-snug">{app.offer?.title || 'Offre supprimée'}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{app.offer?.companyName || '—'}</p>
                            {app.offer?.location && <p className="text-xs text-gray-400 mt-1">{app.offer.location}</p>}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
