package com.example.partition.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for Vertical Partitioning
 * Joins tables from different partitions (by column usage)
 */
@Service
public class VerticalPartitionService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * Get user full info (core + contact + company)
     */
    public Map<String, Object> getUserFullInfo(Integer userId) {
        String sql = """
            SELECT 
                c.user_id,
                c.name,
                c.username,
                c.gender,
                c.date_of_birth,
                ct.email,
                ct.phone,
                ct.address,
                ct.city,
                cmp.company_name,
                cmp.job_title,
                cmp.salary
            FROM users_core c
            LEFT JOIN users_contact ct ON c.user_id = ct.user_id
            LEFT JOIN users_company cmp ON c.user_id = cmp.user_id
            WHERE c.user_id = ?
            """;
        
        try {
            return jdbcTemplate.queryForMap(sql, userId);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
    
    /**
     * Get just core info (fast, minimal columns)
     */
    public Map<String, Object> getUserCore(Integer userId) {
        String sql = "SELECT user_id, name, username, gender FROM users_core WHERE user_id = ?";
        return jdbcTemplate.queryForMap(sql, userId);
    }
    
    /**
     * Get contact info only
     */
    public Map<String, Object> getUserContact(Integer userId) {
        String sql = "SELECT * FROM users_contact WHERE user_id = ?";
        try {
            return jdbcTemplate.queryForMap(sql, userId);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
    
    /**
     * Get company info only
     */
    public Map<String, Object> getUserCompany(Integer userId) {
        String sql = "SELECT * FROM users_company WHERE user_id = ?";
        try {
            return jdbcTemplate.queryForMap(sql, userId);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}
