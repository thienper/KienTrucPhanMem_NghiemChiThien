package org.example.observer;

/**
 * Observer Pattern - Observer Interface
 */
public interface LibraryObserver {
    void update(String message);
    String getName();
}
