package org.example;

import java.util.List;

import org.example.decorator.BasicBorrowService;
import org.example.decorator.BorrowService;
import org.example.decorator.ExtendedTimeDecorator;
import org.example.decorator.PriorityServiceDecorator;
import org.example.decorator.SpecialVersionDecorator;
import org.example.factory.AudioBookFactory;
import org.example.factory.BookFactory;
import org.example.factory.ElectronicBookFactory;
import org.example.factory.PhysicalBookFactory;
import org.example.model.Book;
import org.example.observer.LibraryObserver;
import org.example.observer.LibraryStaff;
import org.example.observer.RegisteredUser;
import org.example.singleton.Library;
import org.example.strategy.SearchByAuthor;
import org.example.strategy.SearchByGenre;
import org.example.strategy.SearchByTitle;
import org.example.strategy.SearchStrategy;

/**
 * Main class - Demonstrates all Design Patterns in Library Management System
 */
public class Main {
    public static void main(String[] args) {
        System.out.println("╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║     HỆ THỐNG QUẢN LÝ THƯ VIỆN - DESIGN PATTERNS DEMO         ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝\n");
        
        // ============================================================
        // 1. SINGLETON PATTERN - Library Instance
        // ============================================================
        System.out.println("\n▶ 1. SINGLETON PATTERN - Khởi tạo thư viện");
        System.out.println("─".repeat(70));
        Library library = Library.getInstance();
        Library library2 = Library.getInstance(); // Same instance
        System.out.println("✓ Library instance 1: " + library.hashCode());
        System.out.println("✓ Library instance 2: " + library2.hashCode());
        System.out.println("✓ Hai instance giống nhau? " + (library == library2));
        
        // ============================================================
        // 2. OBSERVER PATTERN - Register observers
        // ============================================================
        System.out.println("\n▶ 2. OBSERVER PATTERN - Đăng ký người quan sát");
        System.out.println("─".repeat(70));
        LibraryObserver staff1 = new LibraryStaff("Nguyễn Văn A", "Thủ thư");
        LibraryObserver staff2 = new LibraryStaff("Trần Thị B", "Quản lý");
        LibraryObserver user1 = new RegisteredUser("Lê Văn C", "levanc@email.com");
        
        library.registerObserver(staff1);
        library.registerObserver(staff2);
        library.registerObserver(user1);
        
        // ============================================================
        // 3. FACTORY METHOD PATTERN - Create books
        // ============================================================
        System.out.println("\n▶ 3. FACTORY METHOD PATTERN - Tạo sách mới");
        System.out.println("─".repeat(70));
        
        // Create different types of books using factories
        BookFactory physicalFactory = new PhysicalBookFactory();
        BookFactory electronicFactory = new ElectronicBookFactory();
        BookFactory audioFactory = new AudioBookFactory();
        
        Book book1 = physicalFactory.orderBook("B001", "Lập trình Java", "Nguyễn Văn X", "Công nghệ", "Kệ A1");
        Book book2 = physicalFactory.orderBook("B002", "Clean Code", "Robert C. Martin", "Công nghệ", "Kệ A2");
        Book book3 = electronicFactory.orderBook("B003", "Design Patterns", "Gang of Four", "Công nghệ", "PDF", 12.5);
        Book book4 = electronicFactory.orderBook("B004", "Effective Java", "Joshua Bloch", "Công nghệ", "EPUB", 8.3);
        Book book5 = audioFactory.orderBook("B005", "The Pragmatic Programmer", "Andy Hunt", "Công nghệ", "Dave Thomas", 720);
        Book book6 = physicalFactory.orderBook("B006", "Truyện Kiều", "Nguyễn Du", "Văn học", "Kệ B1");
        Book book7 = electronicFactory.orderBook("B007", "Harry Potter", "J.K. Rowling", "Tiểu thuyết", "PDF", 15.0);
        
        // Add books to library (observers will be notified)
        System.out.println("\n▶ Thêm sách vào thư viện (Observer sẽ nhận thông báo):");
        System.out.println("─".repeat(70));
        library.addBook(book1);
        library.addBook(book2);
        library.addBook(book3);
        library.addBook(book4);
        library.addBook(book5);
        library.addBook(book6);
        library.addBook(book7);
        
        // Display all books
        library.displayAllBooks();
        
        // ============================================================
        // 4. STRATEGY PATTERN - Search books
        // ============================================================
        System.out.println("\n▶ 4. STRATEGY PATTERN - Tìm kiếm sách");
        System.out.println("─".repeat(70));
        
        // Search by title
        SearchStrategy searchByTitle = new SearchByTitle();
        List<Book> results1 = library.searchBooks(searchByTitle, "Java");
        displaySearchResults(results1);
        
        // Search by author
        SearchStrategy searchByAuthor = new SearchByAuthor();
        List<Book> results2 = library.searchBooks(searchByAuthor, "Martin");
        displaySearchResults(results2);
        
        // Search by genre
        SearchStrategy searchByGenre = new SearchByGenre();
        List<Book> results3 = library.searchBooks(searchByGenre, "Công nghệ");
        displaySearchResults(results3);
        
        // ============================================================
        // 5. BASIC BORROW/RETURN - Test library functionality
        // ============================================================
        System.out.println("\n▶ 5. MƯỢN VÀ TRẢ SÁCH CƠ BẢN");
        System.out.println("─".repeat(70));
        
        library.borrowBook("B001");
        library.borrowBook("B003");
        library.displayAvailableBooks();
        
        library.returnBook("B001"); // Observers will be notified
        
        // ============================================================
        // 6. DECORATOR PATTERN - Enhanced borrow services
        // ============================================================
        System.out.println("\n▶ 6. DECORATOR PATTERN - Dịch vụ mượn sách mở rộng");
        System.out.println("─".repeat(70));
        
        // Basic borrow
        System.out.println("\n📖 Trường hợp 1: Mượn sách cơ bản");
        BorrowService basic = new BasicBorrowService("Clean Code", 14);
        System.out.println("Mô tả: " + basic.getDescription());
        System.out.println("Chi phí: " + basic.getCost() + " VND");
        basic.execute();
        
        // Borrow with extended time
        System.out.println("\n📖 Trường hợp 2: Mượn sách + Gia hạn");
        BorrowService withExtension = new ExtendedTimeDecorator(
            new BasicBorrowService("Design Patterns", 14), 
            7
        );
        System.out.println("Mô tả: " + withExtension.getDescription());
        System.out.println("Chi phí: " + withExtension.getCost() + " VND");
        withExtension.execute();
        
        // Borrow with special version
        System.out.println("\n📖 Trường hợp 3: Mượn sách + Phiên bản đặc biệt");
        BorrowService withSpecial = new SpecialVersionDecorator(
            new BasicBorrowService("Harry Potter", 14),
            "chữ nổi (Braille)"
        );
        System.out.println("Mô tả: " + withSpecial.getDescription());
        System.out.println("Chi phí: " + withSpecial.getCost() + " VND");
        withSpecial.execute();
        
        // Borrow with multiple decorators
        System.out.println("\n📖 Trường hợp 4: Mượn sách + Nhiều tính năng kết hợp");
        BorrowService premium = new PriorityServiceDecorator(
            new SpecialVersionDecorator(
                new ExtendedTimeDecorator(
                    new BasicBorrowService("The Pragmatic Programmer", 14),
                    10
                ),
                "bản dịch tiếng Việt"
            )
        );
        System.out.println("Mô tả: " + premium.getDescription());
        System.out.println("Chi phí: " + premium.getCost() + " VND");
        premium.execute();
        
        // ============================================================
        // Summary
        // ============================================================
        System.out.println("\n╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║                         TỔNG KẾT                               ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝");
        System.out.println("✓ Tổng số sách trong thư viện: " + library.getTotalBooks());
        System.out.println("✓ Số sách có sẵn: " + library.getAvailableBooksCount());
        System.out.println("✓ Số sách đang được mượn: " + (library.getTotalBooks() - library.getAvailableBooksCount()));
        
        System.out.println("\n╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║              CÁC DESIGN PATTERNS ĐÃ SỬ DỤNG                   ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝");
        System.out.println("1. ✓ Singleton Pattern    - Library (chỉ một instance duy nhất)");
        System.out.println("2. ✓ Factory Method       - BookFactory (tạo các loại sách khác nhau)");
        System.out.println("3. ✓ Strategy Pattern     - SearchStrategy (các chiến lược tìm kiếm)");
        System.out.println("4. ✓ Observer Pattern     - LibraryObserver (thông báo sự kiện)");
        System.out.println("5. ✓ Decorator Pattern    - BorrowDecorator (mở rộng tính năng mượn)");
        System.out.println("\n");
    }
    
    private static void displaySearchResults(List<Book> results) {
        System.out.println("Kết quả tìm được: " + results.size() + " sách");
        for (Book book : results) {
            System.out.println("  • " + book);
        }
        System.out.println();
    }
}