/**
 * Utilitário de cópia para a área de transferência resiliente.
 * Funciona em HTTPS, localhost e em conexões HTTP locais (via fallback).
 */

export async function copiarTexto(texto: string): Promise<boolean> {
  // 1. Tenta a API padrão moderna caso esteja disponível e em contexto seguro
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // Falhou (comum em HTTP local via IP:8080), recorre ao fallback
    }
  }

  // 2. Fallback resiliente usando elemento textarea temporário
  try {
    const areaTexto = document.createElement('textarea');
    areaTexto.value = texto;
    areaTexto.style.position = 'fixed';
    areaTexto.style.left = '-9999px';
    areaTexto.style.top = '0';
    areaTexto.setAttribute('readonly', '');
    document.body.appendChild(areaTexto);
    areaTexto.select();
    const sucesso = document.execCommand('copy');
    document.body.removeChild(areaTexto);
    return sucesso;
  } catch {
    return false;
  }
}
