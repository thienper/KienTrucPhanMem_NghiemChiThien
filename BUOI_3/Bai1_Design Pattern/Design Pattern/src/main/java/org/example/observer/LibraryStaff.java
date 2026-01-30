package org.example.observer;

/**
 * Concrete Observer - Library Staff
 */
public class LibraryStaff implements LibraryObserver {
    private String name;
    private String role;
    
    public LibraryStaff(String name, String role) {
        this.name = name;
        this.role = role;
    }
    
    @Override
    public void update(String message) {
        System.out.println("📢 [" + role + " - " + name + "] đã nhận thông báo: " + message);
    }
    
    @Override
    public String getName() {
        return name + " (" + role + ")";
    }
}
