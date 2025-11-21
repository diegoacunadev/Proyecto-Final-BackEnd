<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# ServiYApp Backend

API RESTful construida con [NestJS](https://nestjs.com/) para la gestión de servicios, usuarios, proveedores y reservas en la plataforma ServiYApp.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Testing](#testing)
- [Principales Endpoints](#principales-endpoints)
- [Módulos Destacados](#módulos-destacados)
- [Swagger](#swagger)
- [Licencia](#licencia)

---

## Descripción

ServiYApp Backend es una API modular que permite:

- Registro y autenticación de usuarios y proveedores.
- Gestión de servicios, categorías y direcciones.
- Creación y administración de órdenes de servicio.
- Integración con Cloudinary para gestión de imágenes.
- Notificaciones, pagos y chat en tiempo real.

## Características

- Arquitectura modular con NestJS y TypeORM.
- Autenticación JWT y Google OAuth.
- Soporte para roles (Admin, User, Provider).
- Documentación automática con Swagger.
- Seeds para datos iniciales.
- Gestión de imágenes con Cloudinary.

## Estructura del Proyecto

```
src/
  app.module.ts
  main.ts
  config/
  helpers/
  modules/
    addresses/
    auth/
    categories/
    chat/
    cloudinary/
    locations/
    notifications/
    payments/
    providers/
    reviews/
    seeds/
    service-orders/
    services/
    users/
```

Cada subcarpeta en `modules/` representa un dominio funcional de la aplicación.

## Instalación

```bash
npm install
```

## Configuración

Copia el archivo `.env` de ejemplo y configura tus variables:

```bash
cp example.env .development.env
```

Edita `.development.env` con tus credenciales de base de datos, Cloudinary, JWT, etc.

## Ejecución

### Desarrollo

```bash
npm run start:dev
```

### Producción

```bash
npm run start:prod
```

## Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Cobertura
npm run test:cov
```

## Principales Endpoints

La API sigue una estructura RESTful. Algunos ejemplos:

### Autenticación

- `POST /auth/register/user` — Registro de usuario.
- `POST /auth/register/provider` — Registro de proveedor.
- `POST /auth/login/user` — Login de usuario con email y contraseña.
- `POST /auth/login/provider` — Login de proveedor con email y contraseña.
- `GET /auth/google/user` — OAuth con Google para usuarios.
- `GET /auth/google/provider` — OAuth con Google para proveedores.

### Usuarios

- `GET /users` — Listar todos los usuarios (solo administrador).
- `GET /users/:id` — Obtener perfil de usuario (solo el propio usuario o administrador).
- `PATCH /users/:id` — Actualizar perfil de usuario (solo el propio usuario o administrador).
- `PATCH /users/:id/upload-profile` — Subir foto de perfil (solo el propio usuario o administrador).
- `PATCH /users/complete/:id` — Completar registro tras Google (solo el propio usuario o administrador).
- `PATCH /users/:id/reactivate` — Reactivar usuario (solo el propio usuario o administrador).
- `DELETE /users/:id` — Eliminar (desactivar) usuario (solo el propio usuario o administrador).

### Proveedores

- `GET /providers` — Listar proveedores.
- `GET /providers/:id` — Obtener perfil de proveedor (solo el propio proveedor o administrador).
- `PATCH /providers/:id` — Actualizar proveedor (solo el propio proveedor o administrador).
- `PATCH /providers/:id/upload-profile` — Subir foto de perfil (solo el propio proveedor o administrador).
- `PATCH /providers/complete/:id` — Completar registro tras Google (solo el propio proveedor o administrador).
- `PATCH /providers/:id/reactivate` — Reactivar proveedor (solo el propio proveedor o administrador).
- `DELETE /providers/:id` — Eliminar (desactivar) proveedor (solo el propio proveedor o administrador).
- `PATCH /providers/:id/validate` — Aprobar o rechazar documentos de un proveedor (solo admin).
- `PATCH /providers/:id/status` — Cambiar el estado de un proveedor (solo admin).

### Servicios
 `GET /services/find-all` — Listar servicios públicos (paginado).
- `GET /services/find/:id` — Obtener detalle de un servicio público.
- `GET /services/find-all-by-param` — Listar servicios ordenados por parámetro (`price` o `duration`).
- `GET /services/filtered-find` — Filtrar servicios por región, ciudad, categoría o nombre.
- `POST /services/create` — Crear servicio (proveedor/admin, permite subir fotos).
- `PATCH /services/update/:id` — Actualizar servicio (proveedor/admin, permite subir fotos).
- `PATCH /services/deactivate/:id` — Desactivar servicio (proveedor/admin).
- `PATCH /services/activate/:id` — Activar servicio (proveedor/admin).
- `PATCH /services/status/:id` — Cambiar estado de servicio (proveedor/admin).
- `GET /services/provider/:providerId` — Listar servicios de un proveedor (proveedor/admin).
- `GET /services/admin/all` — Listar todos los servicios (solo admin).
- `GET /services/pending` — Listar servicios pendientes de aprobación (solo admin).
- `PATCH /services/approve/:id` — Aprobar servicio (solo admin).
- `DELETE /services/delete/:id` — Eliminar servicio (solo admin).

### Órdenes de Servicio

- `POST /service-orders/create` — Crear orden de servicio.
- `GET /service-orders/orders-all` — Listar todas las órdenes de servicio.
- `GET /service-orders/provider/:providerId` — Listar órdenes de un proveedor.
- `GET /service-orders/user/:userId` — Listar órdenes de un usuario.
- `GET /service-orders/orders/:id` — Obtener detalle de una orden.
- `PATCH /service-orders/:id/cancel` — Cancelar una orden.
- `PATCH /service-orders/:id/confirm` — Confirmar una orden.
- `PATCH /service-orders/:id/finish` — Finalizar una orden.

### Direcciones

- `POST /addresses` — Crear una dirección (usuario/admin).
- `GET /addresses` — Listar todas las direcciones del usuario (usuario/admin).
- `GET /addresses/:id` — Obtener una dirección por ID (usuario/admin).
- `PATCH /addresses/:id` — Actualizar una dirección (usuario/admin).
- `PATCH /addresses/deactivate/:id` — Desactivar una dirección (usuario/admin).
- `PATCH /addresses/reactivate/:id` — Reactivar una dirección (usuario/admin).

### Pagos

- `POST /payments/create-preference` — Crear preferencia de pago (MercadoPago).
- `POST /payments/webhook` — Webhook para notificaciones de MercadoPago.
- `GET /payments/success` — Redirección/confirmación de pago exitoso.
- `GET /payments/failure` — Redirección/confirmación de pago fallido.
- `GET /payments/pending` — Redirección/confirmación de pago pendiente.

### Notificaciones

- `POST /notifications` — Crear una notificación.
- `GET /notifications` — Listar todas las notificaciones.
- `GET /notifications/:id` — Obtener una notificación por ID.
- `PATCH /notifications/:id` — Actualizar una notificación.
- `DELETE /notifications/:id` — Eliminar una notificación.

## Módulos Destacados

- **AuthModule**: Maneja autenticación, JWT, Google OAuth.
- **UsersModule**: Gestión de usuarios.
- **ProvidersModule**: Gestión de proveedores y documentos.
- **ServicesModule**: Gestión de servicios y categorías.
- **ServiceOrdersModule**: Gestión de órdenes de servicio.
- **AddressesModule**: Gestión de direcciones y localización.
- **CloudinaryModule**: Subida y gestión de imágenes.
- **PaymentsModule**: Integración con MercadoPago.
- **NotificationsModule**: Notificaciones push/email.
- **ChatModule**: Chat en tiempo real entre usuarios y proveedores.

## Swagger

La documentación interactiva está disponible en:

```
http://localhost:3000/docs
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
# serviapp-backend