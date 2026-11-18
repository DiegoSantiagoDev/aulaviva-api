import { useRoteador } from '../app/Roteador.tsx';
import EmblemaPerdido from '../components/EmblemaPerdido.tsx';
import { Home, BookOpen } from 'lucide-react';

export default function Pagina404() {
  const { navegar } = useRoteador();

  return (
    <main className="av-pagina-centro paper-grain">
      <div className="anim-fade-up flex flex-col items-center">
        <EmblemaPerdido inView={true} className="w-32 h-32 mb-6 text-terra" />

        <span className="av-pill av-pill-erro">Erro 404</span>
        <h1 className="av-titulo mt-3">Página não encontrada</h1>
        <p className="av-lead mx-auto">
          O endereço que você tentou abrir não existe ou foi movido.
          Volte ao início ou abra a biblioteca para encontrar sua aula.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
          <button onClick={() => navegar('/')} className="av-btn av-btn-primario av-btn-lg">
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Voltar ao início</span>
          </button>
          <button onClick={() => navegar('/aulas')} className="av-btn av-btn-contorno av-btn-lg">
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>Ver aulas</span>
          </button>
        </div>
      </div>
    </main>
  );
}
