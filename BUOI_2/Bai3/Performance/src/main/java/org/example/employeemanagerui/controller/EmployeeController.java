package org.example.employeemanagerui.controller;

import java.util.List;

import org.example.employeemanagerui.model.Employee;
import org.example.employeemanagerui.service.EmployeeService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.validation.Valid;

@Controller
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;

    }

    @GetMapping
    public String list(Model model) {
        List<Employee> employees = employeeService.findAll();
        model.addAttribute("employees", employees);
        model.addAttribute("activePage", "employees");
        System.out.println(employees);
        return "employees/list";
    }

    @GetMapping("/create")
    public String createForm(Model model) {
        model.addAttribute("employee", new Employee());
        model.addAttribute("activePage", "employees");
        return "employees/form";
    }

    @PostMapping("/save")
    public String save(@Valid @ModelAttribute Employee employee, org.springframework.validation.BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("activePage", "employees");
            return "employees/form";
        }
        employeeService.save(employee);
        return "redirect:/employees";
    }

    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable Long id, Model model) {
        Employee e = employeeService.findById(id);
        if (e == null) return "redirect:/employees";
        model.addAttribute("employee", e);
        model.addAttribute("activePage", "employees");
        return "employees/form";
    }

    @GetMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        employeeService.delete(id);
        return "redirect:/employees";
    }

}
