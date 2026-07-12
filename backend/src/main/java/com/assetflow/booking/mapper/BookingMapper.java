package com.assetflow.booking.mapper;

import com.assetflow.booking.dto.BookingResponse;
import com.assetflow.booking.entity.AssetBooking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface BookingMapper {

    @Mapping(target = "assetId", source = "asset.id")
    @Mapping(target = "assetName", source = "asset.name")
    @Mapping(target = "bookedById", source = "bookedBy.id")
    @Mapping(target = "bookedByName", source = "bookedBy.name")
    BookingResponse toResponse(AssetBooking booking);
}
