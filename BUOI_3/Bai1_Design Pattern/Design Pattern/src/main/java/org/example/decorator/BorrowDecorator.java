package org.example.decorator;

/**
 * Abstract Decorator - Base decorator class
 */
public abstract class BorrowDecorator implements BorrowService {
    protected BorrowService wrappedService;
    
    public BorrowDecorator(BorrowService service) {
        this.wrappedService = service;
    }
    
    @Override
    public String getDescription() {
        return wrappedService.getDescription();
    }
    
    @Override
    public double getCost() {
        return wrappedService.getCost();
    }
    
    @Override
    public void execute() {
        wrappedService.execute();
    }
}
