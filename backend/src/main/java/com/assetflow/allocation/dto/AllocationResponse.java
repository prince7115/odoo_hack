package com.assetflow.allocation.dto;

import com.assetflow.common.enums.AllocationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationResponse {
    private Long id;
    private Long assetId;
    private String assetTag;
    private String assetName;
    private Long allocatedToId;
    private String allocatedToName;
    private Long allocatedToDeptId;
    private String allocatedToDeptName;
    private Long allocatedById;
    private String allocatedByName;
    private LocalDate allocationDate;
    private LocalDate returnDate;
    private AllocationStatus status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
