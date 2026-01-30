package org.example.decorator;

/**
 * Concrete Decorator - Special Version Service (Braille, Translated, etc.)
 */
public class SpecialVersionDecorator extends BorrowDecorator {
    private String specialType;
    
    public SpecialVersionDecorator(BorrowService service, String specialType) {
        super(service);
        this.specialType = specialType;
    }
    
    @Override
    public String getDescription() {
        return wrappedService.getDescription() + " + Phiên bản " + specialType;
    }
    
    @Override
    public double getCost() {
        return wrappedService.getCost() + 20000; // 20,000 VND for special version
    }
    
    @Override
    public void execute() {
        wrappedService.execute();
        System.out.println("  ➜ Cung cấp phiên bản " + specialType + " (Phí: 20,000 VND)");
    }
}
