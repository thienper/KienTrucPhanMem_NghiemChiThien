package com.example.partition;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Database Partitioning Demo Application
 * 
 * Demonstrates:
 * 1. Horizontal Partitioning - By Gender (table_user_01, table_user_02)
 * 2. Vertical Partitioning - By Column Groups (users_core, users_contact, etc)
 * 3. Function Partitioning - By Date Range (SQL Server Native)
 */
@SpringBootApplication
public class PartitionApplication {
    public static void main(String[] args) {
        SpringApplication.run(PartitionApplication.class, args);
        
        System.out.println("""
            ╔════════════════════════════════════════════════════════╗
            ║   Database Partitioning Demo - Started!                ║
            ║                                                        ║
            ║   Available Endpoints:                                 ║
            ║   - GET  /partition/horizontal/users?gender=Nam       ║
            ║   - GET  /partition/vertical/user/1                   ║
            ║   - GET  /partition/function/users?month=01           ║
            ║   - POST /partition/horizontal/insert (add user)      ║
            ║                                                        ║
            ║   Docs: http://localhost:8080/swagger-ui.html         ║
            ╚════════════════════════════════════════════════════════╝
            """);
    }
}
