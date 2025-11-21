/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerMiddleware } from './helpers/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar Swagger
  const swaggerDoc = new DocumentBuilder()
    .setTitle('ServiYApp | Documentación de API')
    .setDescription(
      'API para la gestión de servicios, usuarios y reservas en la plataforma ServiYApp. Incluye endpoints para autenticación, administración y operaciones de servicios.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const documentModule = SwaggerModule.createDocument(app, swaggerDoc);
  SwaggerModule.setup('docs', app, documentModule);

  app.use((req, res, next) => {
    if (req.path === '/') {
      return res.redirect('/docs');
    }
    next();
  });

  app.use(new LoggerMiddleware().use);

  // Configurar CORS correctamente
  app.enableCors({
    origin: ['http://localhost:3001', 'https://serviyapp-frontend.vercel.app'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`ServiYApp API running on port ${port}`);
}
bootstrap();
