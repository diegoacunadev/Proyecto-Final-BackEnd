import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from 'src/modules/users/entities/user.entity';
import { Address } from 'src/modules/addresses/entities/address.entity';
import { Category } from 'src/modules/categories/entities/category.entity';
import { MessageEntity } from 'src/modules/chat/entities/message.entity';
import { Country } from 'src/modules/locations/entities/country.entity';
import { Region } from 'src/modules/locations/entities/region.entity';
import { City } from 'src/modules/locations/entities/city.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { ProviderDocument } from 'src/modules/providers/entities/provider-document.entity';
import { Provider } from 'src/modules/providers/entities/provider.entity';
import { Schedule } from 'src/modules/providers/entities/schedule.entity';
import { ServiceOrder } from 'src/modules/service-orders/entities/service-order.entity';
import { Service } from 'src/modules/services/entities/service.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { Commission } from 'src/modules/commission/entities/commission.entity';
import { ProviderPayout } from 'src/modules/provider-payouts/entities/provider-payout.entity';
import { Appointment } from 'src/modules/appointments/entities/appointment.entity';

// Detectar entorno
const nodeEnv = process.env.NODE_ENV?.trim() || 'development';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

// Si no hay NODE_ENV definido, asumimos producción (Render siempre tiene variables de entorno)
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Cargar el archivo .env correcto solo en local
if (!isProduction) {
  const envFilePath = isTest ? '.test.env' : '.development.env';
  dotenv.config({ path: envFilePath, override: true });
  console.log(`Cargando archivo env local: ${envFilePath}`);
} else {
  console.log('Cargando variables de entorno de Render (production)');
}

// Leer variable opcional para seed.
const seedOnStart =
  process.env.SEED_ON_START?.toLowerCase() === 'true' ? true : false;

// Configuración de conexión
const config: DataSourceOptions = isProduction
  ? {
      type: 'postgres',
      url: process.env.DATABASE_URL, // Render usa esta variable
      ssl: { rejectUnauthorized: false },
      synchronize:
        process.env.SYNCHRONIZE?.toLowerCase() === 'true' ? true : false,
      entities: [
        User,
        Address,
        Category,
        MessageEntity,
        Country,
        Region,
        City,
        Notification,
        Payment,
        Provider,
        ProviderDocument,
        Schedule,
        ServiceOrder,
        Service,
        Review,
        Commission,
        ProviderPayout,
        Appointment,
      ],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      logging: false,
    }
  : {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      ssl: false,
      synchronize: true,
      dropSchema: seedOnStart,
      logging: !isTest,
    };

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config);
