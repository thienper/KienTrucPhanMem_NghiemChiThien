package com.example.partition.controller;

import com.example.partition.model.User;
import com.example.partition.service.HorizontalPartitionService;
import com.example.partition.service.VerticalPartitionService;
import com.example.partition.service.FunctionPartitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Database Partitioning Demo
 */
@RestController
@RequestMapping("/partition")
@CrossOrigin("*")
public class PartitionController {
    
    @Autowired
    private HorizontalPartitionService horizontalService;
    
    @Autowired
    private VerticalPartitionService verticalService;
    
    @Autowired
    private FunctionPartitionService functionService;
    
    // ========================== HORIZONTAL PARTITIONING ==========================
    
    /**
     * Get users by gender (horizontal partition)
     * Routes to table_user_01 (Nam) or table_user_02 (Nữ)
     */
    @GetMapping("/horizontal/users")
    public ResponseEntity<?> getUsersByGender(@RequestParam String gender) {
        try {
            List<User> users = horizontalService.getUsersByGender(gender);
            Map<String, Object> response = new HashMap<>();
            response.put("partition_table", horizontalService.getPartitionName(gender));
            response.put("gender", gender);
            response.put("count", users.size());
            response.put("users", users);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get users by gender and city
     */
    @GetMapping("/horizontal/users/city")
    public ResponseEntity<?> getUsersByGenderAndCity(
            @RequestParam String gender,
            @RequestParam String city) {
        try {
            List<User> users = horizontalService.getUsersByGenderAndCity(gender, city);
            return ResponseEntity.ok(Map.of(
                    "partition", horizontalService.getPartitionName(gender),
                    "gender", gender,
                    "city", city,
                    "count", users.size(),
                    "users", users
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get users by gender and department
     */
    @GetMapping("/horizontal/users/department")
    public ResponseEntity<?> getUsersByGenderAndDepartment(
            @RequestParam String gender,
            @RequestParam String department) {
        try {
            List<User> users = horizontalService.getUsersByGenderAndDepartment(gender, department);
            return ResponseEntity.ok(Map.of(
                    "partition", horizontalService.getPartitionName(gender),
                    "gender", gender,
                    "department", department,
                    "count", users.size(),
                    "users", users
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Insert new user (routes to correct partition)
     */
    @PostMapping("/horizontal/insert")
    public ResponseEntity<?> insertUser(@RequestBody User user) {
        try {
            horizontalService.insertUser(user);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User inserted to " + horizontalService.getPartitionName(user.getGender()),
                    "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get horizontal partition statistics
     */
    @GetMapping("/horizontal/stats")
    public ResponseEntity<?> getHorizontalStats() {
        try {
            return ResponseEntity.ok(horizontalService.getStatistics());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ========================== VERTICAL PARTITIONING ==========================
    
    /**
     * Get user full info (core + contact + company)
     */
    @GetMapping("/vertical/user/{userId}")
    public ResponseEntity<?> getUserFullInfo(@PathVariable Integer userId) {
        try {
            Map<String, Object> userInfo = verticalService.getUserFullInfo(userId);
            return ResponseEntity.ok(Map.of(
                    "info_type", "full",
                    "user_data", userInfo
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get only core info (fast, minimal columns)
     */
    @GetMapping("/vertical/user/{userId}/core")
    public ResponseEntity<?> getUserCore(@PathVariable Integer userId) {
        try {
            Map<String, Object> userCore = verticalService.getUserCore(userId);
            return ResponseEntity.ok(Map.of(
                    "info_type", "core",
                    "note", "Fast query - only essential columns loaded",
                    "user_data", userCore
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get contact info
     */
    @GetMapping("/vertical/user/{userId}/contact")
    public ResponseEntity<?> getUserContact(@PathVariable Integer userId) {
        try {
            Map<String, Object> contact = verticalService.getUserContact(userId);
            return ResponseEntity.ok(Map.of(
                    "info_type", "contact",
                    "user_data", contact
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get company info
     */
    @GetMapping("/vertical/user/{userId}/company")
    public ResponseEntity<?> getUserCompany(@PathVariable Integer userId) {
        try {
            Map<String, Object> company = verticalService.getUserCompany(userId);
            return ResponseEntity.ok(Map.of(
                    "info_type", "company",
                    "user_data", company
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    // ========================== FUNCTION-BASED PARTITIONING ==========================
    
    /**
     * Get users from specific month (partition routing automatic)
     */
    @GetMapping("/function/users/month")
    public ResponseEntity<?> getUsersByMonth(
            @RequestParam(defaultValue = "2024") Integer year,
            @RequestParam(defaultValue = "1") Integer month) {
        try {
            List<Map<String, Object>> users = functionService.getUsersByMonth(year, month);
            return ResponseEntity.ok(Map.of(
                    "partition_type", "date_range",
                    "year", year,
                    "month", month,
                    "count", users.size(),
                    "users", users,
                    "note", "SQL Server automatically routed to correct partition"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get users from specific quarter
     */
    @GetMapping("/function/users/quarter")
    public ResponseEntity<?> getUsersByQuarter(
            @RequestParam(defaultValue = "2024") Integer year,
            @RequestParam(defaultValue = "1") Integer quarter) {
        try {
            List<Map<String, Object>> users = functionService.getUsersByQuarter(year, quarter);
            return ResponseEntity.ok(Map.of(
                    "partition_type", "date_range_quarter",
                    "year", year,
                    "quarter", quarter,
                    "count", users.size(),
                    "users", users
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Get partition statistics
     */
    @GetMapping("/function/stats")
    public ResponseEntity<?> getPartitionStats() {
        try {
            List<Map<String, Object>> stats = functionService.getPartitionStats();
            return ResponseEntity.ok(Map.of(
                    "partition_stats", stats,
                    "total_partitions", stats.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Partition function might not exist: " + e.getMessage()));
        }
    }
    
    // ========================== DOCUMENTATION ==========================
    
    @GetMapping("/info")
    public ResponseEntity<?> getInfo() {
        return ResponseEntity.ok(Map.of(
                "application", "Database Partitioning Demo",
                "partitioning_types", Map.of(
                        "1_horizontal", "By gender (Nam vs Nữ) - routes to table_user_01 or table_user_02",
                        "2_vertical", "By column groups (core, contact, company) - JOINs as needed",
                        "3_function", "By date range - SQL Server automatic routing"
                ),
                "endpoints", Map.of(
                        "horizontal", "/partition/horizontal/users?gender=Nam",
                        "vertical", "/partition/vertical/user/1",
                        "function", "/partition/function/users/month?year=2024&month=1"
                )
        ));
    }
}
