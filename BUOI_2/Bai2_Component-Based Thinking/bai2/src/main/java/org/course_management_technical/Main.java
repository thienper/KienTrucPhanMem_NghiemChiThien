package org.course_management_technical;

import org.course_management_technical.service.CourseService;

public class Main {
    public static void main(String[] args) {
        CourseService service = new CourseService();
        service.createCourse("Java Backend");
    }
}
