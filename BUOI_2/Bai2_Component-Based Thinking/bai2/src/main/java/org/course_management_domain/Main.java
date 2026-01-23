package org.course_management_domain;

import org.course_management_domain.course.CourseService;
import org.course_management_domain.enrollment.EnrollmentService;
import org.course_management_domain.payment.PaymentService;
import org.course_management_domain.student.StudentService;

public class Main {
    public static void main(String[] args) {
        CourseService courseService = new CourseService();
        StudentService studentService = new StudentService();
        EnrollmentService enrollmentService = new EnrollmentService();
        PaymentService paymentService = new PaymentService();

        courseService.createCourse("Java Backend");
        studentService.registerStudent("An");
        enrollmentService.enroll("An", "Java Backend");
        paymentService.pay("An");
    }
}
