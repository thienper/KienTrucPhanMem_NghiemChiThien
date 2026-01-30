package org.example.strategy;

import java.util.List;

import org.example.model.Book;

/**
 * Strategy Pattern - Search Strategy Interface
 */
public interface SearchStrategy {
    List<Book> search(List<Book> books, String keyword);
}
