package org.example.factory;

import org.example.model.Book;
import org.example.model.ElectronicBook;

/**
 * Concrete Factory for Electronic Books
 */
public class ElectronicBookFactory extends BookFactory {
    
    @Override
    public Book createBook(String id, String title, String author, String genre, Object... additionalParams) {
        String fileFormat = (additionalParams.length > 0) ? (String) additionalParams[0] : "PDF";
        double fileSize = (additionalParams.length > 1) ? (Double) additionalParams[1] : 5.0;
        return new ElectronicBook(id, title, author, genre, fileFormat, fileSize);
    }
}
