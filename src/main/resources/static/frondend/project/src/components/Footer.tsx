import { Github, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-ink text-parchment/70 px-6 py-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-display text-3xl font-bold text-parchment flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold anim-breathe" />
            AulaViva
          </div>
          <p className="mt-2 font-display text-lg italic text-gold-soft">"Nenhuma aula precisa ser perdida."</p>
          <p className="mt-4 max-w-sm leading-relaxed text-sm">
            Sistema inteligente de apoio à aprendizagem. Registra, processa e
            disponibiliza o conteúdo das aulas com inteligência artificial.
          </p>
          <div className="flex gap-3 mt-6">
            {[Instagram, Twitter, Github].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-10 h-10 rounded-full border border-parchment/20 flex items-center justify-center hover:bg-gold hover:text-ink hover:border-gold transition-all duration-300"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-parchment font-semibold mb-4">Explorar</h4>
          <ul className="space-y-2 text-sm">
            {['Funcionamento', 'Inteligência', 'Plataforma', 'Tecnologia', 'Etapas'].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-gold transition-colors duration-300">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-parchment font-semibold mb-4">Institucional</h4>
          <ul className="space-y-2 text-sm">
            {['Sobre', 'Privacidade e LGPD', 'Contato', 'Termos'].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-gold transition-colors duration-300">{l}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-parchment/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs">© 2026 AulaViva. Mais aprendizagem, preparação e oportunidades para todos.</p>
        <p className="text-xs text-gold-soft tracking-widest2 uppercase">Captura · Processamento · Aprendizagem</p>
      </div>
    </footer>
  );
}
