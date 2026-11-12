import { ShieldCheck, Lock, Eye, Trash2, Users } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const points = [
  { icon: ShieldCheck, title: 'Autorização e transparência', desc: 'A implantação depende de autorização da instituição e dos responsáveis, com comunicação clara a professores e estudantes.' },
  { icon: Lock, title: 'Conformidade com a LGPD', desc: 'Observância da legislação de proteção de dados, com atenção especial a dados de crianças e adolescentes.' },
  { icon: Eye, title: 'Acesso controlado por função', desc: 'Quem pode gravar, enviar, consultar, corrigir e excluir conteúdos é definido por usuário e papel.' },
  { icon: Trash2, title: 'Retenção e remoção', desc: 'Prazos de manutenção dos arquivos e tratamento de pedidos de acesso ou remoção são definidos claramente.' },
  { icon: Users, title: 'Validação humana', desc: 'A IA é apresentada como apoio. Resumos e questões precisam de revisão do professor antes do uso oficial.' },
];

export default function Privacy() {
  const { ref, inView } = useReveal(0.15);
  return (
    <section className="relative py-24 px-6 bg-sage/10 paper-grain">
      <div className="max-w-5xl mx-auto">
        <div ref={ref} className={`text-center mb-16 reveal ${inView ? 'in-view' : ''}`}>
          <span className="text-xs tracking-widest2 uppercase text-sage">Privacidade e segurança</span>
          <h2 className="font-display text-5xl md:text-6xl font-bold mt-3 text-ink">
            Dados tratados com responsabilidade
          </h2>
          <p className="mt-4 text-ink-soft max-w-2xl mx-auto">
            Gravações e imagens de um ambiente escolar exigem cuidado especial.
            O AulaViva segue a LGPD e princípios de transparência.
          </p>
          <div className="h-px gold-line w-32 mx-auto mt-8" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {points.map((p, i) => {
            const { ref: r, inView: v } = useReveal(0.3);
            return (
              <div
                ref={r as never}
                key={p.title}
                className={`reveal ${v ? 'in-view' : ''} art-frame rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-sage/15 flex items-center justify-center text-sage">
                  <p.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-xl font-semibold mt-4 text-ink">{p.title}</h3>
                <p className="text-sm text-ink-soft mt-2 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}

          {/* current status card */}
          <div className={`reveal ${inView ? 'in-view' : ''} rounded-2xl p-6 bg-ink text-parchment flex flex-col justify-center`}>
            <h3 className="font-display text-xl font-semibold text-gold-soft">Situação atual</h3>
            <p className="text-sm text-parchment/70 mt-3 leading-relaxed">
              A placa testada até agora foi uma Wemos D1 R2 (ESP8266), com acionamento de LED.
              A migração para ESP32 + INMP441, o backend Spring Boot, a IA e a plataforma
              são partes planejadas — não concluídas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
