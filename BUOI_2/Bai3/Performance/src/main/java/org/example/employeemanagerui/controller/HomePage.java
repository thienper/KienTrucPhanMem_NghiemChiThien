package org.example.employeemanagerui.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


@Controller
@RequestMapping("/")
public class HomePage {
    @GetMapping
    public String homePage(Model model) {
        return "home";
    }
}
