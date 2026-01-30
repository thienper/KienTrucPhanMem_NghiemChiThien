package org.example.observer;

/**
 * Concrete Observer - Registered User
 */
public class RegisteredUser implements LibraryObserver {
    private String name;
    private String email;
    
    public RegisteredUser(String name, String email) {
        this.name = name;
        this.email = email;
    }
    
    @Override
    public void update(String message) {
        System.out.println("📧 [Người dùng - " + name + "] nhận email tại " + email + ": " + message);
    }
    
    @Override
    public String getName() {
        return name + " (" + email + ")";
    }
}
