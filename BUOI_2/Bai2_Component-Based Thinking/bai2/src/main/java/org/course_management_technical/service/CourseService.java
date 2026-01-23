package org.course_management_technical.service;

import org.course_management_technical.repository.CourseRepository;

public class CourseService {
    private CourseRepository repo = new CourseRepository();

    public void createCourse(String name) {
        repo.save(name);
    }
}
