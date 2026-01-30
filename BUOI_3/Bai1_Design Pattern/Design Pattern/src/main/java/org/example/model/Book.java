package org.example.model;

/**
 * Abstract Book class - base class for all book types
 */
public abstract class Book {
    protected String id;
    protected String title;
    protected String author;
    protected String genre;
    protected boolean isAvailable;

    public Book(String id, String title, String author, String genre) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.isAvailable = true;
    }

    // Getters and Setters
    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public String getGenre() { return genre; }
    public boolean isAvailable() { return isAvailable; }
    public void setAvailable(boolean available) { isAvailable = available; }

    // Abstract method - each book type implements its own display
    public abstract String getBookType();

    @Override
    public String toString() {
        return String.format("[%s] %s - %s | Tác giả: %s | Thể loại: %s | Trạng thái: %s",
                id, getBookType(), title, author, genre, isAvailable ? "Có sẵn" : "Đã mượn");
    }
}
