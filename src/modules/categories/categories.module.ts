import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CategoriesSeed } from './seeds/categories.seed';

// Módulo del sistema encargado de la gestión de categorías.
// Incluye el controlador, servicio principal y la precarga inicial (seed).
@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesSeed],
  exports: [CategoriesService, TypeOrmModule, CategoriesSeed],
})
export class CategoriesModule {}
