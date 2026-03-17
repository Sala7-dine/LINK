const FEATURES = [
  {
    title: 'Pilotage des promotions',
    description: 'Suivi centralise des etudiants, candidatures et progression avec des tableaux clairs.',
  },
  {
    title: 'Opportunites ciblees',
    description: 'Publication d offres par les partenaires et matching rapide avec les profils etudiants.',
  },
  {
    title: 'Retours d experience',
    description: 'Les etudiants partagent leurs experiences pour aider les promotions suivantes.',
  },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="py-20 bg-white border-t border-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-zinc-900">Fonctionnalites principales</h2>
          <p className="mt-3 text-zinc-600">Un design inspire du template, adapte a votre workflow LINK.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="card border-zinc-200 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-zinc-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
