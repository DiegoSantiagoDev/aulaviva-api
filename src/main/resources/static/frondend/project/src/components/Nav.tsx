import { useEffect, useState } from 'react';

const links = [
  { label: 'Como funciona', href: '#funcionamento' },
  { label: 'Inteligência', href: '#ia' },
  { label: 'Plataforma', href: '#plataforma' },
  { label: 'Tecnologia', href: '#tecnologia' },
  { label: 'Etapas', href: '#etapas' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-parchment/90 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="font-display text-2xl font-bold text-ink flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gold anim-breathe" />
          AulaViva
        </a>
        <div className="hidden lg:flex items-center gap-7 text-sm text-ink-soft">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="relative group">
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </div>
        <button className="ink-btn px-5 py-2 rounded-full text-sm hidden sm:block">Entrar</button>
        <button
          className="lg:hidden p-2 text-ink"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          <div className="w-6 h-0.5 bg-ink mb-1.5" />
          <div className="w-6 h-0.5 bg-ink mb-1.5" />
          <div className="w-6 h-0.5 bg-ink" />
        </button>
      </div>
      {open && (
        <div className="lg:hidden bg-parchment/95 backdrop-blur-md border-t border-gold/20 mt-3">
          <div className="px-6 py-4 flex flex-col gap-3 text-ink-soft">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-1">
                {l.label}
              </a>
            ))}
            <button className="ink-btn px-5 py-2 rounded-full text-sm mt-2 self-start">Entrar</button>
          </div>
        </div>
      )}
    </nav>
  );
}
