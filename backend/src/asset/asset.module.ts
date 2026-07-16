import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from './schemas/asset.schema';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }])],
  providers: [AssetService],
  controllers: [AssetController],
  exports: [AssetService, MongooseModule],
})
export class AssetModule {}
