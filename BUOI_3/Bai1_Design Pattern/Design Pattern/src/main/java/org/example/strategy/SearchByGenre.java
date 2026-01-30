package org.example.strategy;

import java.util.List;
import java.util.stream.Collectors;

import org.example.model.Book;

/**
 * Concrete Strategy - Search by genre
 */
public class SearchByGenre implements SearchStrategy {
    
    @Override
    public List<Book> search(List<Book> books, String keyword) {
        System.out.println("🔍 Đang tìm kiếm theo thể loại: " + keyword);
        return books.stream()
                .filter(book -> book.getGenre().toLowerCase().contains(keyword.toLowerCase()))
                .collect(Collectors.toList());
    }
}
