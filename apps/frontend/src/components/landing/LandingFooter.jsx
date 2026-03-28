export default function LandingFooter() {
  return (
    <footer id="contact" className="bg-zinc-900 text-zinc-200 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <p className="text-xl font-bold text-white">LINK</p>
          <p className="text-sm text-zinc-400 mt-2">
            Plateforme collaborative ecoles - etudiants - entreprises.
          </p>
        </div>

        <div>
          <p className="font-semibold text-white">Navigation</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            <li>
              <a href="#features" className="hover:text-white">
                Fonctionnalites
              </a>
            </li>
            <li>
              <a href="#offers" className="hover:text-white">
                Opportunites
              </a>
            </li>
            <li>
              <a href="#community" className="hover:text-white">
                Communaute
              </a>
            </li>
          </ul>
        </div>

        <div id="community">
          <p className="font-semibold text-white">Contact</p>
          <p className="mt-3 text-sm text-zinc-400">support@link-platform.com</p>
          <p className="text-sm text-zinc-400">+212 6 00 00 00 00</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-zinc-800 text-xs text-zinc-500">
        © {new Date().getFullYear()} LINK. Tous droits reserves.
      </div>
    </footer>
  );
}
