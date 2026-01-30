package org.example.factory;

import org.example.model.AudioBook;
import org.example.model.Book;

/**
 * Concrete Factory for Audio Books
 */
public class AudioBookFactory extends BookFactory {
    
    @Override
    public Book createBook(String id, String title, String author, String genre, Object... additionalParams) {
        String narrator = (additionalParams.length > 0) ? (String) additionalParams[0] : "Unknown";
        int duration = (additionalParams.length > 1) ? (Integer) additionalParams[1] : 180;
        return new AudioBook(id, title, author, genre, narrator, duration);
    }
}
