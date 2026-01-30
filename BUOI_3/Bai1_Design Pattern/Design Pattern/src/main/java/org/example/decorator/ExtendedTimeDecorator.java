package org.example.decorator;

/**
 * Concrete Decorator - Extended Time Service
 */
public class ExtendedTimeDecorator extends BorrowDecorator {
    private int extraDays;
    
    public ExtendedTimeDecorator(BorrowService service, int extraDays) {
        super(service);
        this.extraDays = extraDays;
    }
    
    @Override
    public String getDescription() {
        return wrappedService.getDescription() + " + Gia hạn thêm " + extraDays + " ngày";
    }
    
    @Override
    public double getCost() {
        return wrappedService.getCost() + (extraDays * 5000); // 5,000 VND per extra day
    }
    
    @Override
    public void execute() {
        wrappedService.execute();
        System.out.println("  ➜ Đã gia hạn thêm " + extraDays + " ngày (Phí: " + (extraDays * 5000) + " VND)");
    }
}
