package org.example.decorator;

/**
 * Decorator Pattern - Component Interface
 */
public interface BorrowService {
    String getDescription();
    double getCost();
    void execute();
}
