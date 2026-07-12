package com.assetflow.dashboard;

import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.assetcategory.repository.AssetCategoryRepository;
import com.assetflow.booking.repository.BookingRepository;
import com.assetflow.common.enums.AssetStatus;
import com.assetflow.common.enums.BookingStatus;
import com.assetflow.dashboard.dto.DashboardStats;
import com.assetflow.department.repository.DepartmentRepository;
import com.assetflow.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AssetRepository assetRepository;
    private final BookingRepository bookingRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AssetCategoryRepository assetCategoryRepository;

    @Transactional(readOnly = true)
    public DashboardStats getStats() {
        long totalAssets = assetRepository.count();

        // Asset counts by status — use repository count queries
        long available = assetRepository.countByStatus(AssetStatus.AVAILABLE);
        long allocated = assetRepository.countByStatus(AssetStatus.ALLOCATED);
        long underMaintenance = assetRepository.countByStatus(AssetStatus.UNDER_MAINTENANCE);
        long disposed = assetRepository.countByStatus(AssetStatus.DISPOSED);

        // Booking counts
        long activeBookings = bookingRepository.countByStatusIn(
                List.of(BookingStatus.APPROVED));
        long pendingBookings = bookingRepository.countByStatusIn(
                List.of(BookingStatus.PENDING));

        return DashboardStats.builder()
                .totalAssets(totalAssets)
                .availableAssets(available)
                .allocatedAssets(allocated)
                .underMaintenanceAssets(underMaintenance)
                .disposedAssets(disposed)
                .activeBookings(activeBookings)
                .pendingBookings(pendingBookings)
                .totalEmployees(employeeRepository.count())
                .totalDepartments(departmentRepository.count())
                .totalCategories(assetCategoryRepository.count())
                .build();
    }
}
