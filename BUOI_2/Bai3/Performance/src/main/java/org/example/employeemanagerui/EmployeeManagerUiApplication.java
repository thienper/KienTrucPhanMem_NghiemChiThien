package org.example.employeemanagerui;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class EmployeeManagerUiApplication {

    public static void main(String[] args) {
        SpringApplication.run(EmployeeManagerUiApplication.class, args);
    }

}
