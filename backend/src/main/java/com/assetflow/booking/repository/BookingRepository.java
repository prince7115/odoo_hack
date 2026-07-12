package com.assetflow.booking.repository;

import com.assetflow.booking.entity.AssetBooking;
import com.assetflow.common.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<AssetBooking, Long> {
    
    List<AssetBooking> findByBookedById(Long employeeId);
    
    @Query("SELECT COUNT(b) > 0 FROM AssetBooking b WHERE b.asset.id = :assetId AND b.status IN (:statuses) AND b.startTime < :endTime AND b.endTime > :startTime")
    boolean existsOverlappingBooking(
            @Param("assetId") Long assetId, 
            @Param("startTime") LocalDateTime startTime, 
            @Param("endTime") LocalDateTime endTime, 
            @Param("statuses") List<BookingStatus> statuses
    );

    long countByStatusIn(List<BookingStatus> statuses);
}
