package com.assetflow.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {

    private long totalAssets;
    private long availableAssets;
    private long allocatedAssets;
    private long underMaintenanceAssets;
    private long disposedAssets;

    private long activeBookings;
    private long pendingBookings;

    private long totalEmployees;
    private long totalDepartments;
    private long totalCategories;
}
