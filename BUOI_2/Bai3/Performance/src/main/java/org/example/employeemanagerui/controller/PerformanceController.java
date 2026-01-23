package org.example.employeemanagerui.controller;

import java.util.List;

import org.example.employeemanagerui.model.Employee;
import org.example.employeemanagerui.service.EmployeeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller để test và so sánh hiệu năng giữa:
 * - Lấy dữ liệu từ database (không cache)
 * - Lấy dữ liệu từ Redis cache
 */
@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    private static final Logger logger = LoggerFactory.getLogger(PerformanceController.class);

    private final EmployeeService employeeService;

    public PerformanceController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * API lấy danh sách employees KHÔNG sử dụng cache
     * Mỗi lần gọi đều query từ database
     */
    @GetMapping("/without-cache")
    public ResponseEntity<PerformanceResult> getEmployeesWithoutCache() {
        logger.info(">>> Gọi API lấy employees KHÔNG sử dụng cache");

        long startTime = System.currentTimeMillis();
        List<Employee> employees = employeeService.findAllWithoutCache();
        long endTime = System.currentTimeMillis();

        PerformanceResult result = new PerformanceResult(
            "KHÔNG SỬ DỤNG CACHE (Query từ Database)",
            endTime - startTime,
            employees.size(),
            employees
        );

        return ResponseEntity.ok(result);
    }

    /**
     * API lấy danh sách employees SỬ DỤNG Redis cache
     * Lần đầu: query từ database và lưu vào cache
     * Các lần sau: lấy từ cache (nhanh hơn)
     */
    @GetMapping("/with-cache")
    public ResponseEntity<PerformanceResult> getEmployeesWithCache() {
        logger.info(">>> Gọi API lấy employees SỬ DỤNG Redis cache");

        long startTime = System.currentTimeMillis();
        List<Employee> employees = employeeService.findAllWithCache();
        long endTime = System.currentTimeMillis();

        PerformanceResult result = new PerformanceResult(
            "SỬ DỤNG REDIS CACHE",
            endTime - startTime,
            employees.size(),
            employees
        );

        logger.info("Tổng thời gian (bao gồm cả lấy từ cache nếu có): {} ms", endTime - startTime);

        return ResponseEntity.ok(result);
    }

    /**
     * API xóa cache để test lại
     */
    @GetMapping("/clear-cache")
    public ResponseEntity<String> clearCache() {
        employeeService.clearCache();
        return ResponseEntity.ok("Đã xóa cache thành công! Bạn có thể test lại.");
    }

    /**
     * API so sánh hiệu năng giữa 2 phương pháp
     */
    @GetMapping("/compare")
    public ResponseEntity<CompareResult> comparePerformance() {
        logger.info("========== BẮT ĐẦU SO SÁNH HIỆU NĂNG ==========");

        // Xóa cache trước khi test
        employeeService.clearCache();

        // Test không cache
        long startNoCache = System.currentTimeMillis();
        List<Employee> employeesNoCache = employeeService.findAllWithoutCache();
        long timeNoCache = System.currentTimeMillis() - startNoCache;

        // Test với cache - lần 1 (chưa có cache, phải query DB)
        long startCacheFirst = System.currentTimeMillis();
        employeeService.findAllWithCache();
        long timeCacheFirst = System.currentTimeMillis() - startCacheFirst;

        // Test với cache - lần 2 (đã có cache, lấy từ Redis)
        long startCacheSecond = System.currentTimeMillis();
        List<Employee> employeesCached = employeeService.findAllWithCache();
        long timeCacheSecond = System.currentTimeMillis() - startCacheSecond;

        CompareResult result = new CompareResult(
            timeNoCache,
            timeCacheFirst,
            timeCacheSecond,
            employeesNoCache.size()
        );

        logger.info("========== KẾT QUẢ SO SÁNH ==========");
        logger.info("Không cache: {} ms", timeNoCache);
        logger.info("Cache lần 1 (query DB + lưu cache): {} ms", timeCacheFirst);
        logger.info("Cache lần 2 (lấy từ Redis): {} ms", timeCacheSecond);
        logger.info("=====================================");

        return ResponseEntity.ok(result);
    }

    /**
     * Class chứa kết quả performance
     */
    public static class PerformanceResult {
        private String method;
        private long executionTimeMs;
        private int totalRecords;
        private List<Employee> employees;

        public PerformanceResult(String method, long executionTimeMs, int totalRecords, List<Employee> employees) {
            this.method = method;
            this.executionTimeMs = executionTimeMs;
            this.totalRecords = totalRecords;
            this.employees = employees;
        }

        // Getters
        public String getMethod() { return method; }
        public long getExecutionTimeMs() { return executionTimeMs; }
        public int getTotalRecords() { return totalRecords; }
        public List<Employee> getEmployees() { return employees; }
    }

    /**
     * Class chứa kết quả so sánh
     */
    public static class CompareResult {
        private long timeWithoutCacheMs;
        private long timeWithCacheFirstCallMs;
        private long timeWithCacheSecondCallMs;
        private int totalRecords;
        private String conclusion;

        public CompareResult(long timeWithoutCacheMs, long timeWithCacheFirstCallMs,
                           long timeWithCacheSecondCallMs, int totalRecords) {
            this.timeWithoutCacheMs = timeWithoutCacheMs;
            this.timeWithCacheFirstCallMs = timeWithCacheFirstCallMs;
            this.timeWithCacheSecondCallMs = timeWithCacheSecondCallMs;
            this.totalRecords = totalRecords;

            if (timeWithCacheSecondCallMs < timeWithoutCacheMs) {
                long improvement = timeWithoutCacheMs - timeWithCacheSecondCallMs;
                double percentage = timeWithoutCacheMs > 0 ?
                    ((double) improvement / timeWithoutCacheMs) * 100 : 0;
                this.conclusion = String.format(
                    "Redis Cache nhanh hơn %d ms (cải thiện %.2f%%)",
                    improvement, percentage
                );
            } else {
                this.conclusion = "Với lượng dữ liệu nhỏ, sự khác biệt không đáng kể";
            }
        }

        // Getters
        public long getTimeWithoutCacheMs() { return timeWithoutCacheMs; }
        public long getTimeWithCacheFirstCallMs() { return timeWithCacheFirstCallMs; }
        public long getTimeWithCacheSecondCallMs() { return timeWithCacheSecondCallMs; }
        public int getTotalRecords() { return totalRecords; }
        public String getConclusion() { return conclusion; }
    }
}

