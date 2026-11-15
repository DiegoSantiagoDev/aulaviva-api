/**
 * Chaves de funcionalidade do front-end.
 *
 * O modo de exemplo só é ativado de forma explícita: `?mock=1` na URL
 * ou `forcarMock = true` abaixo. Nunca há fallback automático quando a
 * API real falha — a UI deve mostrar o erro real.
 */
const forcarMock = false;

export const recursos = {
  /**
   * Ativa dados simulados (mock) somente com `?mock=1` na URL
   * ou quando `forcarMock` estiver explicitamente como true.
   */
  usarMock:
    forcarMock ||
    (typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('mock') === '1'),

  /**
   * Recurso planejado no backend (ocultar/mostrar aula para alunos).
   * Controlado por feature flag até o endpoint estar ativo.
   */
  ocultarAulaAluno: false,

  /**
   * Diálogo de transparência com instruções e prompts da IA.
   */
  mostrarPrompts: true,

  /**
   * Ativa o modo leve automaticamente em dispositivos modestos
   * (poucos núcleos ou pouca memória).
   */
  modoLeveAutomatico: true,
};
