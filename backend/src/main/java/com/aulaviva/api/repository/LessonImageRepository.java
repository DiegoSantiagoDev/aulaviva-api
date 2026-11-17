package com.aulaviva.api.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.aulaviva.api.model.LessonImage;

public interface LessonImageRepository extends JpaRepository<LessonImage, Long> {

    List<LessonImage> findByLessonIdOrderByIdAsc(Long lessonId);

    Optional<LessonImage> findByIdAndLessonId(Long id, Long lessonId);

    @Query("select distinct i.lesson.id from LessonImage i")
    Set<Long> findLessonIdsWithImages();

    long countByLessonId(Long lessonId);
}
