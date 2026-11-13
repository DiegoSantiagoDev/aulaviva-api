import { useRoteador } from '../app/Roteador';
import { Sparkles, ArrowRight } from 'lucide-react';

const exploreLinks = [
  { label: 'Como funciona', id: 'funcionamento' },
  { label: 'Inteligência Artificial', id: 'ia' },
  { label: 'Plataforma do Aluno', id: 'plataforma' },
  { label: 'Tecnologia', id: 'tecnologia' },
  { label: 'Etapas Previstas', id: 'etapas' },
];

export default function Footer() {
  const { navegar } = useRoteador();

  const rolarPara = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-ink text-parchment/70 px-6 py-16 border-t border-gold/20">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-display text-3xl font-bold text-parchment flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold anim-breathe" />
            AulaViva
          </div>
          <p className="mt-2 font-display text-lg italic text-gold-soft">"Nenhuma aula precisa ser perdida."</p>
          <p className="mt-4 max-w-sm leading-relaxed text-sm text-parchment/80">
            Plataforma educacional para recuperação de conteúdo escolar com resumos didáticos,
            apresentações de slides dinâmicas e roteiros para vídeos explicativos no Google NotebookLM.
          </p>

          <div className="mt-6">
            <button
              onClick={() => navegar('/entrar')}
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full bg-gold/15 text-gold-soft hover:bg-gold hover:text-ink transition-all duration-300"
            >
              <span>Entrar no AulaViva</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-parchment font-semibold mb-4 text-sm uppercase tracking-wider">Explorar</h4>
          <ul className="space-y-2.5 text-sm">
            {exploreLinks.map((l) => (
              <li key={l.id}>
                <button
                  onClick={() => rolarPara(l.id)}
                  className="hover:text-gold transition-colors duration-300 text-left"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-parchment font-semibold mb-4 text-sm uppercase tracking-wider">Acesso Rápido</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button
                onClick={() => navegar('/aulas')}
                className="hover:text-gold transition-colors duration-300 text-left flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-gold" />
                <span>Biblioteca do Aluno</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navegar('/professor')}
                className="hover:text-gold transition-colors duration-300 text-left flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-gold" />
                <span>Painel do Professor</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navegar('/entrar')}
                className="hover:text-gold transition-colors duration-300 text-left"
              >
                Porta de Entrada
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-parchment/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-parchment/60">
        <p>&copy; 2026 AulaViva. Todos os direitos reservados. Recuperação e síntese didática com inteligência artificial.</p>
        <p className="text-gold-soft tracking-widest2 uppercase">Captura &middot; Processamento &middot; Aprendizagem</p>
      </div>
    </footer>
  );
}
