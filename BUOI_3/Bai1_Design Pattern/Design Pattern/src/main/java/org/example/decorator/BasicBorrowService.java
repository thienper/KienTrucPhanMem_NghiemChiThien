package org.example.decorator;

/**
 * Concrete Component - Basic Borrow Service
 */
public class BasicBorrowService implements BorrowService {
    private String bookTitle;
    private int borrowDays;
    
    public BasicBorrowService(String bookTitle, int borrowDays) {
        this.bookTitle = bookTitle;
        this.borrowDays = borrowDays;
    }
    
    @Override
    public String getDescription() {
        return "Mượn sách: " + bookTitle + " trong " + borrowDays + " ngày";
    }
    
    @Override
    public double getCost() {
        return 0.0; // Basic borrow is free
    }
    
    @Override
    public void execute() {
        System.out.println("✓ " + getDescription());
    }
}
