package com.example.partition.service;

import com.example.partition.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for Horizontal Partitioning
 * Routes queries to correct partition based on gender
 */
@Service
public class HorizontalPartitionService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    private final RowMapper<User> userRowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setUserId(rs.getInt("user_id"));
        user.setName(rs.getString("name"));
        user.setEmail(rs.getString("email"));
        user.setGender(rs.getString("gender"));
        user.setAge(rs.getInt("age"));
        user.setCity(rs.getString("city"));
        user.setPhone(rs.getString("phone"));
        user.setSalary(rs.getDouble("salary"));
        user.setDepartment(rs.getString("department"));
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            user.setCreatedAt(createdAt.toLocalDateTime());
        }
        return user;
    };
    
    /**
     * Determine partition table name based on gender
     */
    public String getPartitionName(String gender) {
        if ("Nam".equalsIgnoreCase(gender)) {
            return "table_user_01";
        } else if ("Nữ".equalsIgnoreCase(gender)) {
            return "table_user_02";
        } else {
            throw new IllegalArgumentException("Invalid gender: " + gender);
        }
    }
    
    /**
     * Get all users from specific partition
     */
    public List<User> getUsersByGender(String gender) {
        String tableName = getPartitionName(gender);
        String sql = "SELECT * FROM " + tableName + " ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, userRowMapper);
    }
    
    /**
     * Get users from partition with city filter
     */
    public List<User> getUsersByGenderAndCity(String gender, String city) {
        String tableName = getPartitionName(gender);
        String sql = "SELECT * FROM " + tableName + " WHERE city = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, userRowMapper, city);
    }
    
    /**
     * Get users by department within a partition
     */
    public List<User> getUsersByGenderAndDepartment(String gender, String department) {
        String tableName = getPartitionName(gender);
        String sql = "SELECT * FROM " + tableName + " WHERE department = ? ORDER BY salary DESC";
        return jdbcTemplate.query(sql, userRowMapper, department);
    }
    
    /**
     * Insert user to correct partition
     */
    public void insertUser(User user) {
        if (user.getGender() == null) {
            throw new IllegalArgumentException("Gender is required for partition routing");
        }
        
        String tableName = getPartitionName(user.getGender());
        String sql = "INSERT INTO " + tableName + 
                   " (name, email, gender, age, city, phone, salary, department) " +
                   "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        jdbcTemplate.update(sql,
                user.getName(),
                user.getEmail(),
                user.getGender(),
                user.getAge(),
                user.getCity(),
                user.getPhone(),
                user.getSalary(),
                user.getDepartment()
        );
    }
    
    /**
     * Get count statistics by gender
     */
    public java.util.Map<String, Object> getStatistics() {
        String sql = "SELECT 'Nam' AS gender, COUNT(*) AS total FROM table_user_01 " +
                   "UNION ALL " +
                   "SELECT 'Nữ' AS gender, COUNT(*) AS total FROM table_user_02";
        return jdbcTemplate.queryForMap(sql);
    }
}
