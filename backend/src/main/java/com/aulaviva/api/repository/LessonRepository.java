package com.aulaviva.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aulaviva.api.model.Lesson;
import com.aulaviva.api.model.LessonStatus;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findAllByOrderByCreatedAtDesc();

    List<Lesson> findByStatus(LessonStatus status);
}
