package com.aulaviva.api.ai;

import java.nio.file.Path;

/**
 * Converte internamente um arquivo de áudio em texto para que o modelo de resumo compreenda o conteúdo falado. Trocar de provedor de IA significa
 * criar outra implementação desta interface, sem mexer no resto do sistema.
 */
public interface TranscriptionClient {

    String transcribe(Path audioFile);
}
