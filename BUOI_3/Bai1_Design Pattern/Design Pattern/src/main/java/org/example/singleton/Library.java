package org.example.singleton;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.example.model.Book;
import org.example.observer.LibraryObserver;
import org.example.strategy.SearchStrategy;

/**
 * Singleton Pattern - Library class
 * Ensures only one instance of Library exists in the system
 */
public class Library {
    private static Library instance;
    private List<Book> books;
    private List<LibraryObserver> observers;
    
    // Private constructor to prevent instantiation
    private Library() {
        books = new ArrayList<>();
        observers = new ArrayList<>();
        System.out.println("📚 Thư viện đã được khởi tạo!");
    }
    
    /**
     * Thread-safe singleton getInstance method
     */
    public static synchronized Library getInstance() {
        if (instance == null) {
            instance = new Library();
        }
        return instance;
    }
    
    // Observer Pattern methods
    public void registerObserver(LibraryObserver observer) {
        observers.add(observer);
        System.out.println("✓ Đã đăng ký người quan sát: " + observer.getName());
    }
    
    public void removeObserver(LibraryObserver observer) {
        observers.remove(observer);
    }
    
    private void notifyObservers(String message) {
        for (LibraryObserver observer : observers) {
            observer.update(message);
        }
    }
    
    // Book management methods
    public void addBook(Book book) {
        books.add(book);
        String message = "Sách mới: " + book.getTitle() + " (" + book.getBookType() + ")";
        System.out.println("✓ Đã thêm sách vào thư viện: " + book.getTitle());
        notifyObservers(message);
    }
    
    public void removeBook(String bookId) {
        books.removeIf(book -> book.getId().equals(bookId));
        System.out.println("✓ Đã xóa sách ID: " + bookId);
    }
    
    public Book findBookById(String bookId) {
        return books.stream()
                .filter(book -> book.getId().equals(bookId))
                .findFirst()
                .orElse(null);
    }
    
    public List<Book> getAllBooks() {
        return new ArrayList<>(books);
    }
    
    public List<Book> getAvailableBooks() {
        return books.stream()
                .filter(Book::isAvailable)
                .collect(Collectors.toList());
    }
    
    // Borrow and return methods
    public boolean borrowBook(String bookId) {
        Book book = findBookById(bookId);
        if (book != null && book.isAvailable()) {
            book.setAvailable(false);
            System.out.println("✓ Đã mượn sách: " + book.getTitle());
            return true;
        }
        System.out.println("✗ Không thể mượn sách (không tồn tại hoặc đã được mượn)");
        return false;
    }
    
    public boolean returnBook(String bookId) {
        Book book = findBookById(bookId);
        if (book != null && !book.isAvailable()) {
            book.setAvailable(true);
            System.out.println("✓ Đã trả sách: " + book.getTitle());
            String message = "Sách có sẵn trở lại: " + book.getTitle();
            notifyObservers(message);
            return true;
        }
        System.out.println("✗ Không thể trả sách (không tồn tại hoặc chưa được mượn)");
        return false;
    }
    
    // Strategy Pattern - Search books
    public List<Book> searchBooks(SearchStrategy strategy, String keyword) {
        return strategy.search(books, keyword);
    }
    
    // Display methods
    public void displayAllBooks() {
        System.out.println("\n📚 DANH SÁCH TẤT CẢ SÁCH:");
        System.out.println("=".repeat(80));
        if (books.isEmpty()) {
            System.out.println("Thư viện hiện không có sách nào.");
        } else {
            for (Book book : books) {
                System.out.println(book);
            }
        }
        System.out.println("=".repeat(80));
    }
    
    public void displayAvailableBooks() {
        System.out.println("\n📖 DANH SÁCH SÁCH CÓ SẴN:");
        System.out.println("=".repeat(80));
        List<Book> availableBooks = getAvailableBooks();
        if (availableBooks.isEmpty()) {
            System.out.println("Không có sách nào còn sẵn để mượn.");
        } else {
            for (Book book : availableBooks) {
                System.out.println(book);
            }
        }
        System.out.println("=".repeat(80));
    }
    
    public int getTotalBooks() {
        return books.size();
    }
    
    public int getAvailableBooksCount() {
        return (int) books.stream().filter(Book::isAvailable).count();
    }
}
