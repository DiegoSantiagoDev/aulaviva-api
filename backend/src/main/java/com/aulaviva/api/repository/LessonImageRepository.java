package com.aulaviva.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aulaviva.api.model.LessonImage;

public interface LessonImageRepository extends JpaRepository<LessonImage, Long> {

    List<LessonImage> findByLessonIdOrderByIdAsc(Long lessonId);

    Optional<LessonImage> findByIdAndLessonId(Long id, Long lessonId);
}
