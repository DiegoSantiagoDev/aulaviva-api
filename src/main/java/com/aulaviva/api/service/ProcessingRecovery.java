package com.aulaviva.api.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.aulaviva.api.model.Lesson;
import com.aulaviva.api.model.LessonStatus;
import com.aulaviva.api.repository.LessonRepository;

/**
 * Se o servidor reiniciar no meio de um processamento, a aula ficaria em PROCESSING para sempre.
 * Ao subir, marcamos essas aulas como FAILED para o usuário poder reprocessá-las.
 */
@Component
public class ProcessingRecovery {

    private static final Logger log = LoggerFactory.getLogger(ProcessingRecovery.class);

    private final LessonRepository lessons;

    public ProcessingRecovery(LessonRepository lessons) {
        this.lessons = lessons;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void recoverInterruptedLessons() {
        List<Lesson> interrupted = lessons.findByStatus(LessonStatus.PROCESSING);
        for (Lesson lesson : interrupted) {
            lesson.markFailed("Processamento interrompido por reinício do servidor. Use 'Reprocessar'.");
            lessons.save(lesson);
        }
        if (!interrupted.isEmpty()) {
            log.warn("{} aula(s) interrompida(s) foram marcadas como FAILED", interrupted.size());
        }
    }
}
