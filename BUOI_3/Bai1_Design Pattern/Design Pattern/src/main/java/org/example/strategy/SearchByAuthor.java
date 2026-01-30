package org.example.strategy;

import java.util.List;
import java.util.stream.Collectors;

import org.example.model.Book;

/**
 * Concrete Strategy - Search by author
 */
public class SearchByAuthor implements SearchStrategy {
    
    @Override
    public List<Book> search(List<Book> books, String keyword) {
        System.out.println("🔍 Đang tìm kiếm theo tác giả: " + keyword);
        return books.stream()
                .filter(book -> book.getAuthor().toLowerCase().contains(keyword.toLowerCase()))
                .collect(Collectors.toList());
    }
}
