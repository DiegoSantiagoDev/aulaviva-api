import { useRoteador } from '../app/Roteador';
import ArtFigure from '../components/ArtFigure';
import { Home } from 'lucide-react';

export default function Pagina404() {
  const { navegar } = useRoteador();

  return (
    <div className="min-h-screen bg-parchment text-ink flex flex-col items-center justify-center p-6 text-center paper-grain">
      <div className="w-32 h-32 mb-6">
        <ArtFigure pose="david" inView={true} className="w-32 h-32 text-terra" />
      </div>

      <span className="text-xs uppercase tracking-widest2 text-gold font-semibold">
        Erro 404
      </span>
      <h1 className="font-display text-4xl sm:text-5xl font-bold mt-2 text-ink">
        Página não encontrada
      </h1>
      <p className="mt-3 text-ink-soft max-w-md mx-auto text-sm sm:text-base leading-relaxed">
        O caminho que você tentou acessar não existe ou foi movido.
      </p>

      <button
        onClick={() => navegar('/')}
        className="ink-btn mt-8 px-6 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        <span>Voltar ao início</span>
      </button>
    </div>
  );
}
