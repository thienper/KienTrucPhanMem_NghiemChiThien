package org.example.model;

/**
 * Electronic Book - concrete implementation
 */
public class ElectronicBook extends Book {
    private String fileFormat;
    private double fileSize; // in MB

    public ElectronicBook(String id, String title, String author, String genre, String fileFormat, double fileSize) {
        super(id, title, author, genre);
        this.fileFormat = fileFormat;
        this.fileSize = fileSize;
    }

    public String getFileFormat() { return fileFormat; }
    public double getFileSize() { return fileSize; }

    @Override
    public String getBookType() {
        return "Sách điện tử";
    }

    @Override
    public String toString() {
        return super.toString() + String.format(" | Định dạng: %s | Kích thước: %.2f MB", fileFormat, fileSize);
    }
}
