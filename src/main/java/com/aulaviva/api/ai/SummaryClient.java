package com.aulaviva.api.ai;

import java.nio.file.Path;
import java.util.List;

/**
 * Gera o material de estudo a partir da transcrição interna do áudio e, opcionalmente, de fotos do quadro.
 */
public interface SummaryClient {

    String summarize(String title, String subject, String transcript, List<Path> boardImages);
}
