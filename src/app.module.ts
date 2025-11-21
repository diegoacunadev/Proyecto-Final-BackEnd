import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeormConfig from './config/typeorm.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// módulos principales
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { ServicesModule } from './modules/services/services.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ServiceOrdersModule } from './modules/service-orders/service-orders.module';
import { LocationsModule } from './modules/locations/locations.module';
import { SeedsModule } from './modules/seeds/seeds.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ProviderDocumentsModule } from './modules/providers/provider-documents.module';
import { ChatController } from './modules/chat/chat.controller';
import { CommissionModule } from './modules/commission/commission.module';
import { ProviderPayoutsModule } from './modules/provider-payouts/provider-payouts.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeormConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('typeorm');
        if (!config) {
          throw new Error('No se pudo cargar la configuración de TypeORM');
        }
        return config;
      },
    }),

    AuthModule,
    UsersModule,
    ProvidersModule,
    CategoriesModule,
    LocationsModule,
    ServicesModule,
    ServiceOrdersModule,
    SeedsModule,
    PaymentsModule,
    NotificationsModule,
    ChatModule,
    AddressesModule,
    ChatModule,
    ReviewsModule,
    ProviderDocumentsModule,
    CommissionModule,
    ProviderPayoutsModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
