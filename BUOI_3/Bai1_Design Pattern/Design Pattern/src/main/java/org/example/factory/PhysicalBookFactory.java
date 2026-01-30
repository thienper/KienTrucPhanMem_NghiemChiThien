package org.example.factory;

import org.example.model.Book;
import org.example.model.PhysicalBook;

/**
 * Concrete Factory for Physical Books
 */
public class PhysicalBookFactory extends BookFactory {
    
    @Override
    public Book createBook(String id, String title, String author, String genre, Object... additionalParams) {
        String location = (additionalParams.length > 0) ? (String) additionalParams[0] : "Kệ chính";
        return new PhysicalBook(id, title, author, genre, location);
    }
}
