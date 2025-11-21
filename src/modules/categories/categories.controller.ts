import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

// Controlador del módulo "categories".
// Gestiona las operaciones CRUD para las categorías.
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Crea una nueva categoría.
  @Post('create')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  // Obtiene todas las categorías registradas.
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  // Obtiene una categoría por su ID.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  // Actualiza una categoría existente.
  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  // Elimina una categoría de la base de datos.
  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
