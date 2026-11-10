package com.aulaviva.api.ai;

import java.nio.file.Path;
import java.util.List;

public interface SummaryClient {

    String summarize(String title, String subject, String transcript, List<Path> boardImages);
}
