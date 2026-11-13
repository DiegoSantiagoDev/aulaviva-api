import { useEffect, useState } from 'react';
import { useRoteador } from '../app/Roteador';

const links = [
  { label: 'Como funciona', id: 'funcionamento' },
  { label: 'Inteligência', id: 'ia' },
  { label: 'Plataforma', id: 'plataforma' },
  { label: 'Tecnologia', id: 'tecnologia' },
  { label: 'Etapas', id: 'etapas' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { navegar } = useRoteador();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const rolarPara = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-parchment/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-2xl font-bold text-ink flex items-center gap-2 group text-left"
          aria-label="AulaViva - Início"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-gold anim-breathe" />
          AulaViva
        </button>

        <div className="hidden lg:flex items-center gap-7 text-sm text-ink-soft">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => rolarPara(l.id)}
              className="relative group py-1 text-sm text-ink-soft hover:text-ink transition-colors cursor-pointer"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </div>

        <button
          onClick={() => navegar('/entrar')}
          className="ink-btn px-5 py-2 rounded-full text-sm font-semibold hidden sm:inline-flex items-center gap-1.5"
        >
          <span>Entrar</span>
        </button>

        <button
          className="lg:hidden p-2 text-ink focus-visible:outline-none"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu principal"
        >
          <div className="w-6 h-0.5 bg-ink mb-1.5" />
          <div className="w-6 h-0.5 bg-ink mb-1.5" />
          <div className="w-6 h-0.5 bg-ink" />
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-parchment/95 backdrop-blur-md border-t border-gold/20 mt-3 animate-fade-in">
          <div className="px-6 py-4 flex flex-col gap-3 text-ink-soft">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => rolarPara(l.id)}
                className="py-2 text-left text-sm font-medium hover:text-ink"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => {
                setOpen(false);
                navegar('/entrar');
              }}
              className="ink-btn px-5 py-2.5 rounded-full text-sm font-semibold mt-2 self-start"
            >
              Entrar
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
