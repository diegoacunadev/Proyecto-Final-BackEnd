import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import * as fs from 'fs';
import * as path from 'path';

// Servicio encargado de precargar categorías iniciales desde un archivo JSON.
// Se ejecuta automáticamente al iniciar el módulo (solo en entornos no productivos).
@Injectable()
export class CategoriesSeed implements OnModuleInit {
  private readonly logger = new Logger(CategoriesSeed.name);
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async onModuleInit() {
    // Evita la ejecución en entornos de producción.
    // if (process.env.NODE_ENV === 'production') {
    //   console.log('[CategoriesSeed] Entorno de producción, se omite precarga de categorías.');
    //   return;
    // }
    if (process.env.SEED_ON_START !== 'true') {
      this.logger.log('[CategoriesSeed] SEED_ON_START=false → no se ejecuta el seed.');
      return;
    }

    console.log('[CategoriesSeed] Verificando categorías iniciales...');

    // Si ya existen categorías, no se vuelve a cargar el archivo.
    const count = await this.categoryRepo.count();
    if (count > 0) {
      console.log('[CategoriesSeed] Categorías ya existentes, no se requiere carga.');
      return;
    }

    console.log('[CategoriesSeed] Cargando categorías desde JSON...');

    // Ruta del archivo JSON que contiene las categorías iniciales.
    const filePath = path.join('src/modules/categories/seeds/data/categories.json');
    if (!fs.existsSync(filePath)) {
      console.error('[CategoriesSeed] No se encontró el archivo categories.json');
      return;
    }

    // Lectura y parseo del archivo.
    const rawData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawData);

    // Creación de las entidades Category a partir del archivo.
    const categories = data.map((item: any) =>
      this.categoryRepo.create({
        name: item.name,
        description: item.description,
        status: true,
      }),
    );

    // Inserta las categorías en la base de datos.
    await this.categoryRepo.save(categories);
    console.log(`[CategoriesSeed] Se cargaron ${categories.length} categorías correctamente.`);
  }
}
