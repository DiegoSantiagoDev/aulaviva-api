import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useRoteador } from '../app/Roteador';
import './institucional.css';

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
  const navRef = useRef<HTMLElement | null>(null);
  const botaoMenuRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Menu aberto: Esc fecha (devolvendo o foco ao botão) e toque fora também fecha
  useEffect(() => {
    if (!open) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        botaoMenuRef.current?.focus();
      }
    };
    const aoTocarFora = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', aoTeclar);
    document.addEventListener('pointerdown', aoTocarFora);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.removeEventListener('pointerdown', aoTocarFora);
    };
  }, [open]);

  const rolarPara = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Não usamos <a href="#...">: no roteador por hash isso trocaria a rota.
  const pularParaConteudo = () => {
    const main = document.getElementById('conteudo');
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      ref={navRef}
      aria-label="Principal"
      className="av-inst-nav"
      data-rolou={scrolled}
      data-aberto={open}
    >
      <button type="button" className="av-inst-pular" onClick={pularParaConteudo}>
        Pular para o conteúdo
      </button>

      <div className="av-inst-nav-in">
        <button
          type="button"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="av-inst-logo"
          aria-label="AulaViva - Início"
        >
          <span className="av-inst-logo-ponto anim-breathe" aria-hidden="true" />
          AulaViva
        </button>

        <ul className="av-inst-links">
          {links.map((l) => (
            <li key={l.id}>
              <button type="button" onClick={() => rolarPara(l.id)} className="av-inst-link">
                {l.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="av-inst-nav-acoes">
          <button
            type="button"
            onClick={() => navegar('/entrar')}
            className="av-btn av-btn-primario av-inst-nav-entrar"
          >
            Entrar
          </button>

          <button
            ref={botaoMenuRef}
            type="button"
            className="av-inst-menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="menu-principal"
          >
            {open ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="menu-principal" className="av-inst-menu">
          <ul>
            {links.map((l) => (
              <li key={l.id}>
                <button type="button" onClick={() => rolarPara(l.id)} className="av-inst-menu-link">
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
