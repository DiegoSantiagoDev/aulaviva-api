/**
 * Medidor de fps para conferir a fluidez em qualquer máquina (antes/depois de mexer nas animações).
 * Só liga quando a URL tem `?fps` (ex.: http://localhost:5173/?fps#/). Mostra no canto da tela, a cada
 * segundo: fps médio, o pior quadro (ms) e a memória de JS, quando o navegador informa (Chrome).
 * Também escreve o mesmo resumo no console. Retorna a função que desliga o medidor.
 */
export function iniciarMedidorFps(): () => void {
  if (typeof window === 'undefined' || !new URLSearchParams(window.location.search).has('fps')) return () => undefined;

  const caixa = document.createElement('div');
  caixa.setAttribute('aria-hidden', 'true');
  caixa.style.cssText =
    'position:fixed;left:8px;bottom:8px;z-index:9999;padding:6px 9px;border-radius:6px;pointer-events:none;' +
    'font:12px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#fff;background:rgba(0,0,0,.72);white-space:pre';
  document.body.appendChild(caixa);

  let raf = 0;
  let ultimo = performance.now();
  let inicioJanela = ultimo;
  let quadros = 0;
  let pior = 0;

  const laco = (agora: number) => {
    raf = requestAnimationFrame(laco);
    pior = Math.max(pior, agora - ultimo);
    ultimo = agora;
    quadros += 1;
    if (agora - inicioJanela < 1000) return;
    const fps = (quadros * 1000) / (agora - inicioJanela);
    const memoria = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
    const mb = memoria ? ` · JS ${(memoria.usedJSHeapSize / 1048576).toFixed(0)} MB` : '';
    const texto = `${fps.toFixed(0)} fps · pior ${pior.toFixed(0)} ms${mb}`;
    caixa.textContent = texto;
    console.info(`[fps] ${texto}`);
    inicioJanela = agora;
    quadros = 0;
    pior = 0;
  };
  raf = requestAnimationFrame(laco);

  return () => {
    cancelAnimationFrame(raf);
    caixa.remove();
  };
}
