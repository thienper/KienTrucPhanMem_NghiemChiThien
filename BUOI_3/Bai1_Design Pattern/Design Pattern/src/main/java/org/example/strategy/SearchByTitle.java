package org.example.strategy;

import java.util.List;
import java.util.stream.Collectors;

import org.example.model.Book;

/**
 * Concrete Strategy - Search by book title
 */
public class SearchByTitle implements SearchStrategy {
    
    @Override
    public List<Book> search(List<Book> books, String keyword) {
        System.out.println("🔍 Đang tìm kiếm theo tên: " + keyword);
        return books.stream()
                .filter(book -> book.getTitle().toLowerCase().contains(keyword.toLowerCase()))
                .collect(Collectors.toList());
    }
}
