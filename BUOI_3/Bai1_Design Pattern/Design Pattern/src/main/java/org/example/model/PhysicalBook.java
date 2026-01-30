package org.example.model;

/**
 * Physical Book - concrete implementation
 */
public class PhysicalBook extends Book {
    private String location;

    public PhysicalBook(String id, String title, String author, String genre, String location) {
        super(id, title, author, genre);
        this.location = location;
    }

    public String getLocation() { return location; }

    @Override
    public String getBookType() {
        return "Sách giấy";
    }

    @Override
    public String toString() {
        return super.toString() + " | Vị trí: " + location;
    }
}
