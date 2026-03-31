package com.example.inventory_backend.controller;

import com.example.inventory_backend.dto.DashboardStats;
import com.example.inventory_backend.entity.Product;
import com.example.inventory_backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<Product> getProducts(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return service.searchProducts(search);
        }
        return service.getAllProducts();
    }

    @PostMapping
    public Product addProduct(@Valid @RequestBody Product product) {
        return service.addpproduct(product);
    }

    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @Valid @RequestBody Product product) {
        return service.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
    }

    @PostMapping("/{id}/sell")
    public Product sellProduct(@PathVariable Long id, @RequestParam Integer quantity) {
        return service.sellProduct(id, quantity);
    }

    @GetMapping("/stats")
    public DashboardStats getDashboardStats(@RequestParam(required = false) String search) {
        return service.getDashboardStats(search);
    }
}
