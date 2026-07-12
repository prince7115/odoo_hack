package com.assetflow.config;

import com.assetflow.asset.entity.Asset;
import com.assetflow.asset.repository.AssetRepository;
import com.assetflow.assetcategory.entity.AssetCategory;
import com.assetflow.assetcategory.repository.AssetCategoryRepository;
import com.assetflow.common.enums.AssetCondition;
import com.assetflow.common.enums.AssetStatus;
import com.assetflow.common.enums.Role;
import com.assetflow.department.entity.Department;
import com.assetflow.department.repository.DepartmentRepository;
import com.assetflow.employee.entity.Employee;
import com.assetflow.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AssetCategoryRepository assetCategoryRepository;
    private final AssetRepository assetRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (employeeRepository.count() == 0) {
            // Seed Employee
            Employee admin = Employee.builder()
                    .email("admin@assetflow.com")
                    .googleId(null)
                    .role(Role.ADMIN)
                    .name("System Admin")
                    .active(true)
                    .build();
            employeeRepository.save(admin);

            // Seed Departments
            Department itDept = Department.builder()
                    .name("IT")
                    .code("IT-01")
                    .active(true)
                    .build();
            Department hrDept = Department.builder()
                    .name("HR")
                    .code("HR-01")
                    .active(true)
                    .build();
            Department opsDept = Department.builder()
                    .name("Operations")
                    .code("OPS-01")
                    .active(true)
                    .build();
            departmentRepository.saveAll(List.of(itDept, hrDept, opsDept));

            // Seed Asset Categories
            AssetCategory laptops = AssetCategory.builder().name("Laptops").build();
            AssetCategory monitors = AssetCategory.builder().name("Monitors").build();
            AssetCategory keyboards = AssetCategory.builder().name("Keyboards").build();
            AssetCategory projectors = AssetCategory.builder().name("Projectors").build();
            AssetCategory software = AssetCategory.builder().name("Software").build();
            assetCategoryRepository.saveAll(List.of(laptops, monitors, keyboards, projectors, software));

            // Seed Assets
            Asset asset1 = Asset.builder()
                    .assetTag("TAG-LAP-001")
                    .name("MacBook Pro 16")
                    .category(laptops)
                    .department(itDept)
                    .status(AssetStatus.AVAILABLE)
                    .assetCondition(AssetCondition.NEW)
                    .serialNumber(UUID.randomUUID().toString())
                    .purchaseDate(LocalDate.now())
                    .purchaseCost(new BigDecimal("2500.00"))
                    .build();

            Asset asset2 = Asset.builder()
                    .assetTag("TAG-MON-001")
                    .name("Dell UltraSharp 27")
                    .category(monitors)
                    .department(itDept)
                    .status(AssetStatus.AVAILABLE)
                    .assetCondition(AssetCondition.NEW)
                    .serialNumber(UUID.randomUUID().toString())
                    .purchaseDate(LocalDate.now())
                    .purchaseCost(new BigDecimal("500.00"))
                    .build();

            Asset asset3 = Asset.builder()
                    .assetTag("TAG-KEY-001")
                    .name("Logitech MX Keys")
                    .category(keyboards)
                    .department(hrDept)
                    .status(AssetStatus.AVAILABLE)
                    .assetCondition(AssetCondition.NEW)
                    .serialNumber(UUID.randomUUID().toString())
                    .purchaseDate(LocalDate.now())
                    .purchaseCost(new BigDecimal("100.00"))
                    .build();

            Asset asset4 = Asset.builder()
                    .assetTag("TAG-PRO-001")
                    .name("Epson Home Cinema")
                    .category(projectors)
                    .department(opsDept)
                    .status(AssetStatus.AVAILABLE)
                    .assetCondition(AssetCondition.NEW)
                    .serialNumber(UUID.randomUUID().toString())
                    .purchaseDate(LocalDate.now())
                    .purchaseCost(new BigDecimal("800.00"))
                    .build();

            Asset asset5 = Asset.builder()
                    .assetTag("TAG-SOF-001")
                    .name("IntelliJ IDEA Ultimate")
                    .category(software)
                    .department(itDept)
                    .status(AssetStatus.AVAILABLE)
                    .assetCondition(AssetCondition.NEW)
                    .serialNumber(UUID.randomUUID().toString())
                    .purchaseDate(LocalDate.now())
                    .purchaseCost(new BigDecimal("150.00"))
                    .build();

            assetRepository.saveAll(List.of(asset1, asset2, asset3, asset4, asset5));
        }
    }
}
