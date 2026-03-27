package com.example.partition.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

/**
 * Service for Function-Based Partitioning
 * Uses SQL Server partition function (by date range)
 */
@Service
public class FunctionPartitionService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * Get users from specific month using partition function
     * SQL Server auto-routes to correct partition
     */
    public List<Map<String, Object>> getUsersByMonth(Integer year, Integer month) {
        // Construct date range
        int nextMonth = month == 12 ? 1 : month + 1;
        int nextYear = month == 12 ? year + 1 : year;
        
        String startDate = String.format("%04d-%02d-01", year, month);
        String endDate = String.format("%04d-%02d-01", nextYear, nextMonth);
        
        String sql = """
            SELECT * FROM users_partitioned
            WHERE created_date >= CONVERT(DATETIME, ?)
              AND created_date < CONVERT(DATETIME, ?)
            ORDER BY created_date DESC
            """;
        
        return jdbcTemplate.queryForList(sql, startDate, endDate);
    }
    
    /**
     * Get users by quarter
     */
    public List<Map<String, Object>> getUsersByQuarter(Integer year, Integer quarter) {
        int startMonth = (quarter - 1) * 3 + 1;
        int endMonth = quarter == 4 ? 1 : startMonth + 3;
        int endYear = quarter == 4 ? year + 1 : year;
        
        String sql = """
            SELECT * FROM users_partitioned
            WHERE YEAR(created_date) = ? 
              AND QUARTER(created_date) = ?
            ORDER BY created_date DESC
            """;
        
        return jdbcTemplate.queryForList(sql, year, quarter);
    }
    
    /**
     * Get partition statistics
     */
    public List<Map<String, Object>> getPartitionStats() {
        String sql = """
            SELECT 
                $PARTITION.pf_DateRange(created_date) AS partition_number,
                COUNT(*) AS row_count,
                MIN(created_date) AS min_date,
                MAX(created_date) AS max_date
            FROM users_partitioned
            GROUP BY $PARTITION.pf_DateRange(created_date)
            ORDER BY partition_number
            """;
        
        try {
            return jdbcTemplate.queryForList(sql);
        } catch (Exception e) {
            System.err.println("Partition stats query failed: " + e.getMessage());
            return List.of();
        }
    }
}
