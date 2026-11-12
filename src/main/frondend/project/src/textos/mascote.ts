/**
 * Falas contextuais do mascote ArtFigure por estado e situação
 */

export type EstadoMascote =
  | 'boas-vindas'
  | 'lendo'
  | 'professor'
  | 'processando'
  | 'enviando'
  | 'alcancando'
  | 'sucesso'
  | 'erro'
  | 'vazio';

export const falasMascote: Record<EstadoMascote, string[]> = {
  'boas-vindas': [
    'Olá! Que bom ter você aqui no AulaViva. Por onde quer começar?',
    'Bem-vindo! Todo o conhecimento da sala de aula te esperando.',
    'Perdeu alguma aula? Não se preocupe, vamos recuperar o tempo juntos!',
  ],
  lendo: [
    'Bons estudos! Revise com calma os tópicos em destaque.',
    'Dica de ouro: anote no seu caderno as perguntas de fixação!',
    'Estudar um pouco a cada dia faz toda a diferença.',
  ],
  professor: [
    'Área do educador: envie os áudios e deixe a IA cuidar da estrutura.',
    'Fotos do quadro ajudam muito na precisão do resumo!',
    'Acompanhe o processamento e publique para sua turma.',
  ],
  processando: [
    'Estou analisando a aula e organizando os conceitos principais...',
    'Transcrevendo a voz e montando os slides didáticos...',
    'Quase pronto! Nossos modelos de IA estão estruturando o conteúdo.',
  ],
  enviando: [
    'Enviando seus arquivos com segurança para o servidor...',
    'Comprimindo as imagens e transmitindo o áudio...',
  ],
  alcancando: [
    'Siga os 7 passos ao lado para criar seu vídeo explicativo no NotebookLM!',
    'Copie o prompt e o resumo: o NotebookLM vai gerar uma aula em vídeo incrível.',
  ],
  sucesso: [
    'Excelente! Conteúdo pronto para estudo!',
    'Copiado com sucesso! Agora é só colar no destino.',
    'Aula processada com perfeição!',
  ],
  erro: [
    'Algo não saiu como esperado... Que tal tentar de novo?',
    'Ops! Ocorreu uma oscilação na rede ou no áudio.',
  ],
  vazio: [
    'Ainda não encontrei aulas por aqui... Tente outro termo de busca!',
    'Nenhuma aula cadastrada nesta matéria no momento.',
  ],
};

export function obterFalaAleatoria(estado: EstadoMascote): string {
  const opcoes = falasMascote[estado] || falasMascote['boas-vindas'];
  const indice = Math.floor(Math.random() * opcoes.length);
  return opcoes[indice];
}
