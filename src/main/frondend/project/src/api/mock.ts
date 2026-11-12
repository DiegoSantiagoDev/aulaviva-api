import {
  LessonListItem,
  LessonResponse,
  PromptsResponse,
  CreateLessonRequest,
  ImageResponse,
} from './tipos';

const mockLessons: LessonResponse[] = [
  {
    id: 1,
    title: 'Função do 1º Grau e Aplicações no Cotidiano',
    subject: 'Matemática',
    status: 'DONE',
    hasAudio: true,
    summary: `ASSUNTOS PRINCIPAIS
Definição de função afim, interpretação gráfica do coeficiente angular e linear, raiz ou zero da função e resolução de problemas práticos do dia a dia.

RESUMO DA AULA
A aula iniciou com a contextualização de grandezas diretamente proporcionais através de exemplos práticos, como a cobrança de corridas por aplicativo e contas de água com taxa fixa. Foi demonstrada a estrutura algébrica fundamental f(x) = ax + b, onde "a" representa a taxa de variação (inclinação da reta) e "b" o valor inicial (intercepto no eixo vertical y).

CONCEITOS E EXEMPLOS IMPORTANTES
- Coeficiente Angular (a): se a > 0 a função é estritamente crescente; se a < 0 a função é decrescente. Se a = 0 temos uma função constante.
- Coeficiente Linear (b): ponto exato onde a reta corta o eixo das ordenadas (0, b).
- Raiz ou Zero da Função: valor de x para o qual f(x) = 0. Algebricamente determinado por x = -b/a.
- Exemplo da corrida: Valor = R$ 5,00 (bandeirada fixa b) + R$ 2,50 por km rodado (coeficiente a). Para 10 km rodados: V(10) = 2,50(10) + 5 = R$ 30,00.

PONTOS PARA REVISAR
- Diferença entre função linear (sem termo independente, b = 0) e função afim geral.
- Identificação visual rápida de retas crescentes e decrescentes no plano cartesiano.
- Cuidados na manipulação dos sinais ao calcular o zero da função com coeficientes negativos.

PERGUNTAS DE REVISÃO
1. Em uma função dada por f(x) = -3x + 12, qual é o valor da raiz da função?
2. Se uma reta corta o eixo y no ponto (0, -4) e possui inclinação positiva, em qual quadrante ela jamais tocará?
3. Como você explica intuitivamente a taxa de variação em um gráfico de tempo versus distância?`,
    presentation: {
      title: 'Função do 1º Grau e Aplicações',
      slides: [
        {
          title: 'Função do 1º Grau e Aplicações',
          layout: 'capa',
          content: [
            'Matemática Fundamental',
            'Prof. Adriano Lobo',
            'Compreendendo retas, inclinações e taxas no cotidiano',
          ],
        },
        {
          title: 'O que é uma Função Afim?',
          layout: 'definicao',
          content: [
            'Uma função polinomial do 1º grau é qualquer relação da forma f(x) = ax + b, com coeficientes reais a e b, sendo necessariamente a ≠ 0.',
            'O gráfico no plano cartesiano é sempre uma linha reta oblíqua aos eixos coordenados.',
          ],
        },
        {
          title: 'Estrutura Algébrica e Fórmulas',
          layout: 'formula',
          content: [
            'f(x) = ax + b',
            'Taxa de variação: a = Δy / Δx',
            'Zero da função: x = -b / a',
            'Ponto no eixo vertical: (0, b)',
          ],
        },
        {
          title: 'Comportamento dos Coeficientes',
          layout: 'conteudo',
          content: [
            'O coeficiente "a" determina a declividade da reta em relação ao eixo horizontal.',
            'Quando a > 0, conforme x aumenta, f(x) também cresce.',
            'Quando a < 0, a reta inclina para a esquerda e a função é decrescente.',
            'O coeficiente "b" fixa a altura inicial em que a reta intercepta o eixo Y.',
          ],
        },
        {
          title: 'Exemplo Prático: Tarifa de Táxi',
          layout: 'exemplo',
          content: [
            'Bandeirada inicial fixa: R$ 5,50 (coeficiente linear b).',
            'Custo por quilômetro rodado: R$ 2,40 (coeficiente angular a).',
            'Equação de custo: C(x) = 2,40x + 5,50.',
            'Custo para 15 km: C(15) = 2,40 · 15 + 5,50 = R$ 41,50.',
          ],
        },
        {
          title: 'Crescente versus Decrescente',
          layout: 'duas-colunas',
          content: [
            'Função Crescente (a > 0): ângulo agudo com eixo X. Maior x acarreta maior y.',
            'Exemplo: rendimento de poupança, produção em série ao longo das horas.',
            'Função Decrescente (a < 0): ângulo obtuso com eixo X. Maior x acarreta menor y.',
            'Exemplo: volume de água restante em uma caixa vazando, depreciação.',
          ],
        },
        {
          title: 'Resumo dos Pontos Fundamentais',
          layout: 'revisao',
          content: [
            'O gráfico de f(x) = ax + b é invariavelmente uma reta.',
            'O coeficiente angular a comanda a inclinação e o sentido de crescimento.',
            'O coeficiente linear b é o valor numérico em x = 0.',
            'A raiz é a coordenada x onde a reta cruza o eixo horizontal.',
          ],
        },
        {
          title: 'Perguntas para Fixação',
          layout: 'perguntas',
          content: [
            '1. Qual o zero da função para g(x) = -4x + 20?',
            '2. Se uma reta passa pela origem (0, 0), quanto vale seu coeficiente b?',
            '3. O que ocorre graficamente se dobrarmos o valor de a mantendo b fixo?',
          ],
        },
      ],
    },
    failureReason: null,
    images: [
      { id: 101, originalName: 'quadro-funcao-grafico.jpg', url: '/api/lessons/1/images/101' },
      { id: 102, originalName: 'exercicio-tabela.jpg', url: '/api/lessons/1/images/102' },
    ],
    createdAt: '2026-11-08T14:30:00.000Z',
    hidden: false,
  },
  {
    id: 2,
    title: 'Revolução Francesa: Queda da Bastilha e Iluminismo',
    subject: 'História',
    status: 'DONE',
    hasAudio: true,
    summary: `ASSUNTOS PRINCIPAIS
Crise do Antigo Regime francês, divisão social nos Três Estados, influência dos ideais iluministas e os eventos decisivos de 1789.

RESUMO DA AULA
Analisamos a conjuntura política e econômica da França no final do século XVIII. A sociedade estratificada concedia privilégios tributários ao Primeiro (Clero) e Segundo (Nobreza) Estados, sobrecarregando o Terceiro Estado com pesados impostos em meio a secas severas e crise financeira da monarquia de Luís XVI.

CONCEITOS E EXEMPLOS IMPORTANTES
- Três Estados: Clero (0,5%), Nobreza (1,5%) e Terceiro Estado (98% - burgueses, camponeses e artesãos).
- Iluminismo: Montesquieu (separação dos três poderes), Voltaire (liberdade de expressão) e Rousseau (soberania popular).
- Queda da Bastilha (14 de julho de 1789): tomada da fortaleza-prisão símbolo do absolutismo régio, marcando a entrada popular na revolução.
- Declaração dos Direitos do Homem e do Cidadão: proclamação da igualdade jurídica e do lema Liberdade, Igualdade e Fraternidade.

PONTOS PARA REVISAR
- As diferenças de interesses entre a alta burguesia (girondinos) e os jacobinos radicais.
- O impacto da dívida contraída pela França no apoio à Independência dos Estados Unidos.`,
    presentation: null,
    failureReason: null,
    images: [
      { id: 201, originalName: 'esquema-estados-franca.jpg', url: '/api/lessons/2/images/201' },
    ],
    createdAt: '2026-11-07T10:15:00.000Z',
    hidden: false,
  },
  {
    id: 3,
    title: 'Fotossíntese e Bioenergética Celular',
    subject: 'Biologia',
    status: 'PROCESSING',
    hasAudio: true,
    summary: null,
    presentation: null,
    failureReason: null,
    images: [
      { id: 301, originalName: 'cloroplasto-esquema.png', url: '/api/lessons/3/images/301' },
    ],
    createdAt: '2026-11-12T05:00:00.000Z',
    hidden: false,
  },
  {
    id: 4,
    title: 'Cinemática Vetorial e Lançamento de Projéteis',
    subject: 'Física',
    status: 'FAILED',
    hasAudio: true,
    summary: null,
    presentation: null,
    failureReason: 'Áudio captado com ruído acústico excessivo que impossibilitou a transcrição aos 4 minutos e 12 segundos.',
    images: [],
    createdAt: '2026-11-05T16:45:00.000Z',
    hidden: false,
  },
];

setTimeout(() => {
  const aulaProcessing = mockLessons.find((l) => l.id === 3);
  if (aulaProcessing && aulaProcessing.status === 'PROCESSING') {
    aulaProcessing.status = 'DONE';
    aulaProcessing.summary = `ASSUNTOS PRINCIPAIS
Etapas fotoquímica (clara) e química (escura) da fotossíntese, estrutura dos cloroplastos e conversão de energia luminosa em energia química.

RESUMO DA AULA
Estudamos detalhadamente a equação global da fotossíntese (6 CO₂ + 6 H₂O + luz → C₆H₁₂O₆ + 6 O₂). A fase clara ocorre nos tilacoides e depende de luz para a fotólise da água e produção de ATP e NADPH. A fase de fixação de carbono ocorre no estroma através do Ciclo de Calvin.`;
  }
}, 8000);

export function simularAtraso<T>(dado: T, ms: number = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(dado), ms));
}

export const mockApi = {
  listarAulas: async (): Promise<LessonListItem[]> => {
    return simularAtraso(
      mockLessons.map((l) => ({
        id: l.id,
        title: l.title,
        subject: l.subject,
        status: l.status,
        createdAt: l.createdAt,
        hidden: l.hidden,
        hasSlides: Boolean(l.presentation && l.presentation.slides.length > 0),
      })),
      350
    );
  },

  obterAula: async (id: number): Promise<LessonResponse> => {
    const aula = mockLessons.find((l) => l.id === id);
    if (!aula) {
      throw { status: 404, message: `Aula não encontrada: ${id}` };
    }
    return simularAtraso(aula, 300);
  },

  criarAula: async (req: CreateLessonRequest): Promise<LessonResponse> => {
    const novaAula: LessonResponse = {
      id: Date.now(),
      title: req.title.trim(),
      subject: req.subject.trim(),
      status: 'CREATED',
      hasAudio: false,
      summary: null,
      presentation: null,
      failureReason: null,
      images: [],
      createdAt: new Date().toISOString(),
      hidden: false,
    };
    mockLessons.unshift(novaAula);
    return simularAtraso(novaAula, 450);
  },

  enviarAudio: async (
    id: number,
    _file: File,
    onProgress?: (porcentagem: number) => void
  ): Promise<LessonResponse> => {
    const aula = mockLessons.find((l) => l.id === id);
    if (!aula) throw { status: 404, message: `Aula não encontrada: ${id}` };
    if (aula.status === 'PROCESSING') {
      throw { status: 409, message: 'A aula já está sendo processada. Aguarde o término.' };
    }

    if (onProgress) {
      for (let p = 10; p <= 100; p += 20) {
        onProgress(p);
        await new Promise((r) => setTimeout(r, 60));
      }
    }

    aula.status = 'PROCESSING';
    aula.hasAudio = true;
    aula.failureReason = null;

    setTimeout(() => {
      if (aula.status === 'PROCESSING') {
        aula.status = 'DONE';
        aula.summary = `RESUMO GERADO COM SUCESSO
O áudio da aula foi transcrito e o resumo didático estruturado foi produzido pela IA.`;
      }
    }, 7000);

    return aula;
  },

  reprocessar: async (id: number): Promise<LessonResponse> => {
    const aula = mockLessons.find((l) => l.id === id);
    if (!aula) throw { status: 404, message: `Aula não encontrada: ${id}` };
    if (aula.status === 'PROCESSING') {
      throw { status: 409, message: 'A aula já está sendo processada.' };
    }
    aula.status = 'PROCESSING';
    aula.failureReason = null;

    setTimeout(() => {
      aula.status = 'DONE';
      aula.summary = `RESUMO REPROCESSADO
O conteúdo foi reavaliado e consolidado com sucesso.`;
    }, 6000);

    return simularAtraso(aula, 300);
  },

  enviarImagem: async (id: number, file: File): Promise<ImageResponse> => {
    const aula = mockLessons.find((l) => l.id === id);
    if (!aula) throw { status: 404, message: `Aula não encontrada: ${id}` };
    const novaImagem: ImageResponse = {
      id: Date.now(),
      originalName: file.name,
      url: URL.createObjectURL(file),
    };
    aula.images.push(novaImagem);
    return simularAtraso(novaImagem, 400);
  },

  obterPrompts: async (id: number): Promise<PromptsResponse> => {
    const aula = mockLessons.find((l) => l.id === id);
    if (!aula) throw { status: 404, message: `Aula não encontrada: ${id}` };
    return simularAtraso(
      {
        summary: {
          version: '1.2.0',
          model: 'Qwen 3.8 27B (via Groq)',
          generatedAt: aula.createdAt,
          text: `Você é um professor especialista do ensino brasileiro. Com base na transcrição do áudio e nas fotos do quadro, crie um resumo didático em português com as seções em caixa alta: ASSUNTOS PRINCIPAIS, RESUMO DA AULA, CONCEITOS E EXEMPLOS IMPORTANTES, PONTOS PARA REVISAR e PERGUNTAS DE REVISÃO. Explique conceitos difíceis de forma simples e acolhedora para alunos de 12 a 18 anos.`,
        },
        slides: {
          version: '1.1.0',
          model: 'Qwen 3.8 27B (via Groq)',
          generatedAt: aula.createdAt,
          text: `A partir do resumo estruturado da aula "${aula.title}", gere uma apresentação em JSON com title e slides[]. Cada slide deve conter title, layout e content (uma lista de tópicos curtos e objetivos). Utilize layouts adequados: capa, definicao, formula, conteudo, exemplo, duas-colunas, revisao e perguntas.`,
        },
        video: {
          text: `Crie um vídeo explicativo em português do Brasil sobre a aula "${aula.title}" de ${aula.subject}, para estudantes. Use somente as informações do resumo adicionado como fonte. Explique os conceitos com calma, mostre os exemplos da aula passo a passo e termine com os pontos principais. Não invente informações que não estejam na fonte.`,
        },
      },
      300
    );
  },
};
