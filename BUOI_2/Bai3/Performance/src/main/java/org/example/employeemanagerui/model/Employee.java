package org.example.employeemanagerui.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Entity
@Table(name = "employee")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Employee implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Họ và tên đầy đủ là bắt buộc")
    @Pattern(regexp = "^[^0-9\\p{Punct}]+( [^0-9\\p{Punct}]+)*$", message = "Tên đầy đủ không được chứa chữ số hoặc ký tự đặc biệt")
    private String empName;

    @NotBlank(message = "Email là bắt buộc")
    @Email(message = "Email phải là địa chỉ email hợp lệ")
    private String email;

    @NotNull(message = "Tuổi là bắt buộc")
    @Min(value = 19, message = "Tuổi phải > 18")
    private Integer age;

    @Pattern(regexp = "^(Active|Inactive)$", message = "Status: Giá trị hợp lệ là 'Active' hoặc 'Inactive'")
    private String status = "Active";

    @NotNull(message = "Lương là bắt buộc")
    @DecimalMin(value = "0.0", inclusive = false, message = "Lương phải lớn hơn 0")
    private Double salary;
}
