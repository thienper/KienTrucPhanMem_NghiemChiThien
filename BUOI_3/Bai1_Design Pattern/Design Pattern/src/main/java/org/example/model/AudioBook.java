package org.example.model;

/**
 * Audio Book - concrete implementation
 */
public class AudioBook extends Book {
    private String narrator;
    private int durationMinutes;

    public AudioBook(String id, String title, String author, String genre, String narrator, int durationMinutes) {
        super(id, title, author, genre);
        this.narrator = narrator;
        this.durationMinutes = durationMinutes;
    }

    public String getNarrator() { return narrator; }
    public int getDurationMinutes() { return durationMinutes; }

    @Override
    public String getBookType() {
        return "Sách nói";
    }

    @Override
    public String toString() {
        return super.toString() + String.format(" | Người đọc: %s | Thời lượng: %d phút", narrator, durationMinutes);
    }
}
