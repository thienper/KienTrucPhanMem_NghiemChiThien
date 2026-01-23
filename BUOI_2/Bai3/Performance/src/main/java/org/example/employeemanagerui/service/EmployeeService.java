package org.example.employeemanagerui.service;

import java.util.List;

import org.example.employeemanagerui.model.Employee;
import org.example.employeemanagerui.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService {
    private static final Logger logger = LoggerFactory.getLogger(EmployeeService.class);

    private final EmployeeRepository repo;

    public EmployeeService(EmployeeRepository repo) {
        this.repo = repo;
    }

    /**
     * Hàm lấy danh sách employee KHÔNG sử dụng cache (nguyên bản)
     * Log thời gian thực thi
     */
    public List<Employee> findAllWithoutCache() {
        long startTime = System.currentTimeMillis();

        List<Employee> employees = repo.findAll();

        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;

        logger.info("=== KHÔNG SỬ DỤNG CACHE ===");
        logger.info("Thời gian lấy danh sách employees: {} ms", executionTime);
        logger.info("Số lượng employees: {}", employees.size());

        return employees;
    }

    /**
     * Hàm lấy danh sách employee SỬ DỤNG Redis cache
     * Log thời gian thực thi
     */
    @Cacheable(value = "employees", key = "'allEmployees'")
    public List<Employee> findAllWithCache() {
        long startTime = System.currentTimeMillis();

        List<Employee> employees = repo.findAll();

        long endTime = System.currentTimeMillis();
        long executionTime = endTime - startTime;

        logger.info("=== SỬ DỤNG REDIS CACHE ===");
        logger.info("Thời gian lấy danh sách employees từ DATABASE (lần đầu - chưa cache): {} ms", executionTime);
        logger.info("Số lượng employees: {}", employees.size());

        return employees;
    }

    /**
     * Xóa cache khi có thay đổi dữ liệu
     */
    @CacheEvict(value = "employees", allEntries = true)
    public void clearCache() {
        logger.info("=== ĐÃ XÓA CACHE EMPLOYEES ===");
    }

    public List<Employee> findAll() { return repo.findAll(); }

    public Employee findById(Long id) { return repo.findById(id).orElse(null); }

    @CacheEvict(value = "employees", allEntries = true)
    public Employee save(Employee e) { return repo.save(e); }

    @CacheEvict(value = "employees", allEntries = true)
    public void delete(Long id) { repo.deleteById(id); }
}
