import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Allocation, AllocationSchema } from './schemas/allocation.schema';
import { Asset, AssetSchema } from '../asset/schemas/asset.schema';
import { AllocationService } from './allocation.service';
import { AllocationController } from './allocation.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Allocation.name, schema: AllocationSchema },
      { name: Asset.name, schema: AssetSchema },
    ]),
  ],
  providers: [AllocationService],
  controllers: [AllocationController],
  exports: [AllocationService],
})
export class AllocationModule {}
