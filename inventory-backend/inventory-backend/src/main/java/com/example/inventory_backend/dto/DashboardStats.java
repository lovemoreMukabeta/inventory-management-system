package com.example.inventory_backend.dto;

import java.util.List;
import java.util.Map;

public record DashboardStats(
        long totalProducts, 
        long lowStock, 
        double totalValue, 
        Map<String, Long> stockByCategory,
        List<Long> salesTrends
) {
}
