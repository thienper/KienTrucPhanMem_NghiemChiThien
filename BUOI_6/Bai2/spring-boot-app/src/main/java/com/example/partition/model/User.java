package com.example.partition.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * User Model
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private Integer userId;
    private String name;
    private String email;
    private String gender;  // "Nam" or "Nữ"
    private Integer age;
    private String city;
    private String phone;
    private Double salary;
    private String department;
    private LocalDateTime createdAt;
    private LocalDateTime hireDate;
}

/**
 * User response for vertical partitioning
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
class UserFullInfo {
    // Core info
    private Integer userId;
    private String name;
    private String username;
    private String gender;
    
    // Contact info
    private String email;
    private String phone;
    private String address;
    private String city;
    
    // Company info
    private String companyName;
    private String jobTitle;
    private Double salary;
}

/**
 * Request to insert new user (horizontal partition)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
class InsertUserRequest {
    private String name;
    private String email;
    private String gender;  // Required for routing
    private Integer age;
    private String city;
    private String phone;
    private Double salary;
    private String department;
}
