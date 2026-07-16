import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetCategory, AssetCategorySchema } from './schemas/asset-category.schema';
import { AssetCategoryService } from './asset-category.service';
import { AssetCategoryController } from './asset-category.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: AssetCategory.name, schema: AssetCategorySchema }])],
  providers: [AssetCategoryService],
  controllers: [AssetCategoryController],
  exports: [AssetCategoryService, MongooseModule],
})
export class AssetCategoryModule {}
