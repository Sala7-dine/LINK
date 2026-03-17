import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHero from '../../components/common/PageHero';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { offerService } from '../../services';
import { toast } from 'react-toastify';
import { MapPinIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const COLUMNS = [
  { id: 'interested', label: 'Intéressé', color: 'bg-blue-500', dot: 'bg-blue-400', light: 'bg-blue-50' },
  { id: 'applied', label: 'Postulé', color: 'bg-yellow-500', dot: 'bg-yellow-400', light: 'bg-yellow-50' },
  { id: 'interview', label: 'Entretien', color: 'bg-purple-500', dot: 'bg-purple-400', light: 'bg-purple-50' },
  { id: 'accepted', label: 'Accepté', color: 'bg-green-500', dot: 'bg-green-400', light: 'bg-green-50' },
  { id: 'rejected', label: 'Refusé', color: 'bg-red-500', dot: 'bg-red-400', light: 'bg-red-50' },
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

  if (isLoading) return (
    <div className="py-20 text-center animate-fade-in-up">
      <div className="inline-block relative w-12 h-12">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-green-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-zinc-500 font-medium">Chargement de votre kanban...</p>
    </div>
  );

  return (
    <>
      <PageHero 
        title="Mes candidatures" 
        description="Suivez l'avancement de vos postulations par glisser-déposer."
        bgImage="https://images.unsplash.com/photo-1542621334-a254cf47733d?auto=format&fit=crop&q=80&w=2000"
      />
      <div className="space-y-8 animate-fade-in-up h-full flex flex-col">

      <div className="flex-1 overflow-hidden min-h-[600px]">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 overflow-x-auto pb-6 h-full items-start">
            {COLUMNS.map((col) => {
              const columnApps = byStatus(col.id);
              return (
                <div key={col.id} className="flex-shrink-0 w-80 flex flex-col max-h-full">
                  {/* Column Header */}
                  <div className={`flex items-center gap-3 mb-4 px-1`}>
                    <div className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${col.dot} opacity-50`} />
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${col.color}`} />
                    </div>
                    <span className="font-bold text-zinc-800 text-lg">{col.label}</span>
                    <span className="ml-auto text-sm font-semibold bg-white border border-zinc-200 text-zinc-500 rounded-full px-3 py-0.5 shadow-sm">
                      {columnApps.length}
                    </span>
                  </div>

                  {/* Drop Zone */}
                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 min-h-[150px] rounded-3xl p-3 space-y-3 transition-colors duration-300 border ${
                          snapshot.isDraggingOver 
                            ? `${col.light} border-${col.color.split('-')[1]}-200` 
                            : 'bg-zinc-50/80 border-zinc-200/50 hover:bg-zinc-100/50'
                        }`}
                      >
                        {columnApps.map((app, index) => (
                          <Draggable key={app._id} draggableId={app._id} index={index}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                className={`bg-white rounded-2xl p-5 border transition-all duration-200 cursor-grab active:cursor-grabbing ${
                                  snap.isDragging 
                                    ? 'shadow-2xl shadow-green-900/10 border-green-500 scale-105 rotate-2 z-50' 
                                    : 'shadow-sm border-zinc-100 hover:shadow-md hover:border-zinc-200'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-3">
                                  <p className="font-bold text-zinc-900 leading-tight">
                                    {app.offer?.title || 'Offre supprimée'}
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-600">
                                    <BuildingOfficeIcon className="w-4 h-4 text-zinc-400" />
                                    {app.offer?.companyName || '—'}
                                  </div>
                                  
                                  {app.offer?.location && (
                                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                                      <MapPinIcon className="w-4 h-4 text-zinc-400" />
                                      {app.offer.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
    </>
  );
}
