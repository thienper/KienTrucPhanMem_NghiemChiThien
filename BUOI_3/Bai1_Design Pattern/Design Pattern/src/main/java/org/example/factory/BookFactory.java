package org.example.factory;

import org.example.model.Book;

/**
 * Factory Method Pattern - Abstract Factory for creating books
 */
public abstract class BookFactory {
    
    /**
     * Factory method - subclasses will implement this to create specific book types
     */
    public abstract Book createBook(String id, String title, String author, String genre, Object... additionalParams);
    
    /**
     * Template method - common logic for book creation
     */
    public Book orderBook(String id, String title, String author, String genre, Object... additionalParams) {
        Book book = createBook(id, title, author, genre, additionalParams);
        System.out.println("✓ Đã tạo sách mới: " + book.getBookType() + " - " + title);
        return book;
    }
}
