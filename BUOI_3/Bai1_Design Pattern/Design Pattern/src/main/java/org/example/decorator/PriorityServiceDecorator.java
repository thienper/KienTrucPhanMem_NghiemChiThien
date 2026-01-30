package org.example.decorator;

/**
 * Concrete Decorator - Priority Service
 */
public class PriorityServiceDecorator extends BorrowDecorator {
    
    public PriorityServiceDecorator(BorrowService service) {
        super(service);
    }
    
    @Override
    public String getDescription() {
        return wrappedService.getDescription() + " + Dịch vụ ưu tiên";
    }
    
    @Override
    public double getCost() {
        return wrappedService.getCost() + 15000; // 15,000 VND for priority
    }
    
    @Override
    public void execute() {
        wrappedService.execute();
        System.out.println("  ➜ Được ưu tiên xử lý nhanh (Phí: 15,000 VND)");
    }
}
