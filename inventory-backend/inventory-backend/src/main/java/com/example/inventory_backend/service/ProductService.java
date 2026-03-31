package com.example.inventory_backend.service;

import com.example.inventory_backend.dto.DashboardStats;
import com.example.inventory_backend.entity.Product;
import com.example.inventory_backend.entity.Transaction;
import com.example.inventory_backend.repository.ProductRepository;
import com.example.inventory_backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepo;
    private final TransactionRepository transactionRepo;

    public ProductService(ProductRepository productRepo, TransactionRepository transactionRepo) {
        this.productRepo = productRepo;
        this.transactionRepo = transactionRepo;
    }

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return productRepo.findAll();
        }
        return productRepo.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(keyword, keyword);
    }

    public Product addpproduct(Product product) {
        return productRepo.save(product);
    }

    public Product updateProduct(Long id, Product details) {
        Product existing = productRepo.findById(id).orElseThrow();
        existing.setName(details.getName());
        existing.setCategory(details.getCategory());
        existing.setStock(details.getStock());
        existing.setPrice(details.getPrice());
        return productRepo.save(existing);
    }

    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }

    public Product sellProduct(Long id, Integer quantity) {
        Product existing = productRepo.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        if (existing.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }
        
        existing.setStock(existing.getStock() - quantity);
        Product savedProduct = productRepo.save(existing);
        
        Transaction transaction = Transaction.builder()
                .product(savedProduct)
                .quantity(quantity)
                .totalPrice(savedProduct.getPrice() * quantity)
                .timestamp(LocalDateTime.now())
                .build();
                
        transactionRepo.save(transaction);
        
        return savedProduct;
    }

    public DashboardStats getDashboardStats(String keyword) {
        List<Product> products;
        if (keyword != null && !keyword.trim().isEmpty()) {
            products = productRepo.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(keyword, keyword);
        } else {
            products = productRepo.findAll();
        }

        long totalProducts = products.size();

        long lowStock = products.stream().filter(p -> p.getStock() > 0 && p.getStock() < 20).count();
        double totalValue = products.stream().mapToDouble(p -> p.getPrice() * p.getStock()).sum();
        
        Map<String, Long> stockByCategory = products.stream()
                .collect(Collectors.groupingBy(Product::getCategory, Collectors.summingLong(Product::getStock)));

        List<Transaction> transactions = transactionRepo.findTransactionsAfter(LocalDateTime.now().minusDays(7));
        List<Long> salesTrends = new ArrayList<>(Collections.nCopies(7, 0L));
        LocalDate today = LocalDate.now();
        
        for (Transaction t : transactions) {
            int daysAgo = (int) ChronoUnit.DAYS.between(t.getTimestamp().toLocalDate(), today);
            if (daysAgo >= 0 && daysAgo < 7) {
                int index = 6 - daysAgo;
                salesTrends.set(index, salesTrends.get(index) + t.getQuantity());
            }
        }

        return new DashboardStats(totalProducts, lowStock, totalValue, stockByCategory, salesTrends);
    }
}

