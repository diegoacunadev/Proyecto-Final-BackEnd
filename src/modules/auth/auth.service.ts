import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/modules/users/users.service';
import { ProvidersService } from 'src/modules/providers/providers.service';
import { Role } from './roles.enum';
import { ProviderStatus } from '../providers/enums/provider-status.enum';
import { getGoogleRedirectUrl } from 'src/helpers/redirect.helper';
import { UserStatus } from '../users/enums/user-status.enum';
import { CreateProviderDto } from '../providers/dto/create-provider.dto';
import { MailerService } from './mailer.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly providersService: ProvidersService,
    private readonly jwtService: JwtService,
    private mailerService: MailerService,
  ) {}


      //USUARIOS

  // Registro tradicional de usuario
  async registerUser(data: any) {
    const email = data.email.trim().toLowerCase();

    // Verificar si el correo ya está registrado
    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // Validar que el país exista en la base de datos
    if (!data.country) {
      throw new BadRequestException('Debe seleccionar un país válido');
    }

    const country = await this.usersService.validateCountryById(data.country);
    if (!country) {
      throw new BadRequestException('El país seleccionado no existe');
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Crear el usuario con los valores por defecto
    const newUser = await this.usersService.create({
      names: data.names,
      surnames: data.surnames || '',
      email,
      password: hashedPassword,
      phone: data.phone || null,
      country,
      role: Role.User,
      status: UserStatus.ACTIVE,
    });

    // Enviar correo de bienvenida
    this.mailerService.sendWelcomeUserMail(newUser).catch((err) =>
      console.error('Error enviando correo de bienvenida usuario:', err),
    );

    // Generar el token JWT
    const payload = { id: newUser.id, email: newUser.email, role: newUser.role, country: newUser.country?.name || newUser.country };
    const token = this.jwtService.sign(payload, { expiresIn: '30m' });

    // Respuesta limpia y estructurada
    return {
      message: 'Usuario registrado correctamente',
      access_token: token,
      user: {
        id: newUser.id,
        names: newUser.names,
        surnames: newUser.surnames,
        email: newUser.email,
        phone: newUser.phone,
        country: newUser.country,
        role: newUser.role,
        status: newUser.status,
      },
    };
  }

  // Registro/Login mediante Google (usuarios)
  async validateOrCreateGoogleUser(userData: any) {
    const email = userData.email.trim().toLowerCase();

    // Verificar si ya existe el usuario
    let user = await this.usersService.findByEmail(email);

    // Si no existe, crear un nuevo usuario "incompleto"
    if (!user) {
      const [firstName, ...rest] = (userData.names || '').split(' ');
      const lastName = rest.join(' ') || userData.surnames || '';

      user = await this.usersService.create({
        names: firstName || email.split('@')[0],
        surnames: lastName,
        email,
        password: '', // Google -- no requiere password
        role: Role.User,
        status: UserStatus.INCOMPLETE, // Estado incompleto hasta que termine el registro
        profilePicture: userData.profilePicture || null,
      });

      // Enviar correo de bienvenida
      this.mailerService.sendWelcomeUserMail(user).catch((err) =>
        console.error('Error enviando correo de bienvenida usuario Google:', err),
      );
    } else {
      // Si ya existe, actualizamos su foto de perfil si no tenía
      if (!user.profilePicture && userData.profilePicture) {
        user.profilePicture = userData.profilePicture;
        await this.usersService.save(user);
      }
    }

    return user;
  }

  async handleGoogleUserRedirect(user: any) {
    console.log('handleGoogleUserRedirect: usuario recibido =>', user);

    if (!user || !user.id) {
      console.error('Usuario sin ID al manejar redirección Google User');
      return {
        redirectUrl:
          process.env.FRONTEND_BASE_URL + '/login?error=google_user_not_found',
      };
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload, { expiresIn: '30m' });

    // Si el usuario está incompleto, redirigir a completar registro
    const base = process.env.FRONTEND_BASE_URL;
    const redirectUrl =
      user.status === UserStatus.INCOMPLETE
        ? `${base}/complete-register-user/?id=${user.id}&role=${user.role}&token=${token}`
        : `${base}/user/dashboard?id=${user.id}&role=${user.role}&token=${token}`;

    console.log('Redirigiendo al frontend:', redirectUrl);
    return { redirectUrl };
  }

  // Completar registro por medio de google
  async completeRegisterUser(userId: string, data: any) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new BadRequestException('Usuario no encontrado');

    if (user.status !== UserStatus.INCOMPLETE) {
      throw new BadRequestException('El registro ya está completo');
    }

    // Validar país
    const country = await this.usersService.validateCountryById(data.country);
    if (!country) {
      throw new BadRequestException('El país seleccionado no existe');
    }

    // Actualizar datos del usuario
    user.names = data.names;
    user.surnames = data.surnames;
    user.phone = data.phone;
    user.country = country;
    user.status = UserStatus.ACTIVE;

    await this.usersService.save(user);

    // Generar nuevo token JWT
    const payload = { id: user.id, email: user.email, role: user.role, country: user.country?.name || user.country, };
    const token = this.jwtService.sign(payload, { expiresIn: '30m' });

    return {
      message: 'Registro completado correctamente',
      access_token: token,
      user: {
        id: user.id,
        names: user.names,
        surnames: user.surnames,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        status: user.status,
      },
    };
  }

  // Login de usuario tradicional
  async loginUser(email: string, password: string) {
    email = email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Contraseña incorrecta');
  
    // Bloquear suspendidos
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException(
        'Tu cuenta está suspendida. Contacta con soporte para más información.',
      );
    }

    // Reactivar si estaba eliminado o inactivo
    if ([UserStatus.DELETED, UserStatus.INACTIVE].includes(user.status)) {
      user.status = UserStatus.ACTIVE;
      await this.usersService.save(user);
    }

    const payload = { id: user.id, email: user.email, role: user.role,   country: user.country?.name || user.country, };
    return {
      message: 'Usuario autenticado correctamente',
      access_token: this.jwtService.sign(payload, { expiresIn: '30m' }),
      user,
    };
  }


  // Login de usuario con Google
  async loginGoogleUser(user) {
    
    // Bloquear suspendidos
    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException(
        'Tu cuenta está suspendida. Contacta con soporte para más información.',
      );
    }

    // Reactivar si estaba eliminado o inactivo
    if ([UserStatus.DELETED, UserStatus.INACTIVE].includes(user.status)) {
      user.status = UserStatus.ACTIVE;
      await this.usersService.save(user);
    }

    // Si estaba incompleto, no se autentica aún — se redirige a completar registro
    if (user.status === UserStatus.INCOMPLETE) {
      return {
        message: 'El usuario debe completar su registro antes de iniciar sesión',
        redirect: `${process.env.FRONTEND_BASE_URL}/complete-register-user/?role=${user.role}`,
      };
    }

    // Generar token de acceso
    const payload = { id: user.id, email: user.email, role: user.role, country: user.country?.name || user.country, };
    const token = this.jwtService.sign(payload, { expiresIn: '30m' });

    return {
      message: 'Usuario autenticado correctamente',
      access_token: token,
      user,
    };
  }



  async sendPasswordResetEmail(email: string, type: 'user' | 'provider') {
    let entity: any;

    if (type === 'user') {
      entity = await this.usersService.findByEmail(email);
    } else {
      entity = await this.providersService.findByEmail(email);
    }

    if (!entity) throw new NotFoundException(`No existe ${type} con ese correo.`);

    const token = await this.jwtService.signAsync(
      { sub: entity.id, type },
      { expiresIn: '15m', secret: process.env.JWT_SECRET! },
    );

    const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password?id=${entity.id}&type=${type}&token=${token}`;

    await this.mailerService.sendPasswordResetMail(entity, resetLink, type);
    return { message: `Correo de recuperación enviado al ${type}.` };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET!,
      });

      const hashed = await bcrypt.hash(newPassword, 10);

      if (payload.type === 'user') {
        await this.usersService.update(payload.sub, { password: hashed });
      } else if (payload.type === 'provider') {
        await this.providersService.update(payload.sub, { password: hashed });
      }

      return { message: 'Contraseña actualizada correctamente' };
    } catch {
      throw new BadRequestException('Token inválido o expirado');
    }
  }




  

      //PROVEEDORES

  // Registro de proveedor (con validación de país, región, ciudad)
  async registerProvider(data: CreateProviderDto) {
    const email = data.email.trim().toLowerCase();

    // Validar duplicado
    const existing = await this.providersService.findByEmail(email);
    if (existing) throw new BadRequestException('El correo ya está registrado');

    // Crear proveedor
    const newProvider = await this.providersService.create({
      names: data.names,
      surnames: data.surnames,
      userName: data.userName,
      email,
      phone: data.phone,
      password: data.password,
      countryId: data.countryId,
      regionId: data.regionId,
      cityId: data.cityId,
      address: data.address,
      role: Role.Provider,
      status: ProviderStatus.ACTIVE, // activo por defecto
      isCompleted: false,            // aún no validado por admin
    });

    // Enviar correo de bienvenida
    this.mailerService.sendWelcomeProviderMail(newProvider).catch((err) =>
      console.error('Error enviando correo de bienvenida proveedor:', err),
    );


    // Generar JWT
    const payload = { id: newProvider.id, email: newProvider.email, role: newProvider.role };
    const token = this.jwtService.sign(payload, { expiresIn: '30m' });

    return {
      message: 'Proveedor registrado correctamente',
      access_token: token,
      provider: {
        id: newProvider.id,
        names: newProvider.names,
        surnames: newProvider.surnames,
        userName: newProvider.userName,
        email: newProvider.email,
        phone: newProvider.phone,
        country: newProvider.country,
        region: newProvider.region,
        city: newProvider.city,
        address: newProvider.address,
        role: newProvider.role,
        status: newProvider.status,
        isCompleted: newProvider.isCompleted,
      },
    };
  }

  // Registro/Login mediante Google (proveedores)
  async validateOrCreateGoogleProvider(providerData: any) {
    const email = providerData.email.trim().toLowerCase();

    // Buscar si el proveedor ya existe
    let provider = await this.providersService.findByEmail(email);

    // Si ya existe, actualizamos datos mínimos si es necesario
    if (provider) {
      // Reactivar si estaba eliminado o inactivo
      if ([ProviderStatus.DELETED, ProviderStatus.INACTIVE].includes(provider.status)) {
        provider.status = ProviderStatus.ACTIVE;
        await this.providersService.save(provider);
      }

      // Actualizar foto de perfil si no tenía
      if (!provider.profilePicture && providerData.profilePicture) {
        provider.profilePicture = providerData.profilePicture;
        await this.providersService.save(provider);
      }

      return provider;
    }

    // Si no existe, crear uno nuevo (incompleto)
    const baseName = (providerData.names || email.split('@')[0])
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();

    let userName = baseName;

    const existingUsername = await this.providersService.findByUsername(userName);
    if (existingUsername) {
      const suffix = Math.floor(Math.random() * 10000);
      userName = `${baseName}${suffix}`;
    }

    provider = await this.providersService.create({
      names: providerData.names || 'Proveedor',
      surnames: providerData.surnames || '',
      userName,
      email,
      phone: '',
      password: '',
      role: Role.Provider,
      profilePicture: providerData.profilePicture || null,
      status: ProviderStatus.INCOMPLETE, // estado inicial
      isCompleted: false,                 // aún no validado por admin
    });

    this.mailerService.sendWelcomeProviderMail(provider).catch((err) =>
      console.error('Error enviando correo de bienvenida proveedor Google:', err),
    );

    return provider;
  }

  async handleGoogleProviderRedirect(provider: any) {
    console.log('handleGoogleProviderRedirect: proveedor recibido =>', provider);

    if (!provider || !provider.id) {
      console.error('Proveedor sin ID al manejar redirección Google');
      return {
        redirectUrl:
          process.env.FRONTEND_BASE_URL + '/login?error=google_provider_not_found',
      };
    }

    // Generar payload y token
    const payload = {
      id: provider.id,
      email: provider.email,
      role: provider.role || Role.Provider,
    };

    const token = this.jwtService.sign(payload, { expiresIn: '30m' });

    // Determinar URL de redirección según si completó el registro o no
    const base = process.env.FRONTEND_BASE_URL;
    const redirectUrl = provider.status === ProviderStatus.INCOMPLETE
    ? `${base}/complete-register-provider/?id=${provider.id}&role=${payload.role}&token=${token}`
    : `${base}/provider/dashboard?id=${provider.id}&role=${payload.role}&token=${token}`;

    
    // const redirectUrl = provider.isCompleted
      // ? `${base}/provider/dashboard?id=${provider.id}&role=${payload.role}&token=${token}`
      // : `${base}/complete-register-provider/?id=${provider.id}&role=${payload.role}&token=${token}`;

    console.log('Redirigiendo al frontend:', redirectUrl);
    return { redirectUrl };
  }

  // Completar registro del proveedor tras autenticación con Google
  async completeRegisterProvider(providerId: string, data: any) {
    const provider = await this.providersService.findOne(providerId);
    if (!provider) throw new BadRequestException('Proveedor no encontrado');

    // Si ya completó su perfil, no debe repetir el proceso
    if (provider.status !== ProviderStatus.INCOMPLETE) {
      throw new BadRequestException('El perfil ya está completo o activo');
    }

    // Validar ubicación (país, región, ciudad)
    let country = provider.country;
    let region = provider.region;
    let city = provider.city;

    if (data.countryId && data.regionId && data.cityId) {
      const loc = await this.providersService.validateLocation(
        data.countryId,
        data.regionId,
        data.cityId,
      );
      country = loc.country;
      region = loc.region;
      city = loc.city;
    }

    // Actualizar los datos del proveedor
    provider.names = data.names || provider.names;
    provider.surnames = data.surnames || provider.surnames;
    provider.phone = data.phone || provider.phone;
    provider.address = data.address || provider.address;
    provider.country = country;
    provider.region = region;
    provider.city = city;
    provider.status = ProviderStatus.ACTIVE; // ahora puede acceder a su panel
    provider.isCompleted = false; // aún no ha enviado documentos 

    await this.providersService.save(provider);

    // Generar nuevo token
    const payload = { id: provider.id, email: provider.email, role: provider.role };
    const token = this.jwtService.sign(payload, { expiresIn: '30m' });

    return {
      message: 'Registro de proveedor completado correctamente',
      access_token: token,
      provider: {
        id: provider.id,
        names: provider.names,
        surnames: provider.surnames,
        email: provider.email,
        phone: provider.phone,
        address: provider.address,
        country: provider.country,
        region: provider.region,
        city: provider.city,
        role: provider.role,
        status: provider.status,
        isCompleted: provider.isCompleted,
      },
    };
  }

  // Login tradicional del proveedor
  async loginProvider(email: string, password: string) {
    email = email.trim().toLowerCase();
    const provider = await this.providersService.findByEmail(email);
    if (!provider) throw new UnauthorizedException('Proveedor no encontrado');

    // Validar contraseña
    const isMatch = await bcrypt.compare(password, provider.password);
    if (!isMatch) throw new UnauthorizedException('Contraseña incorrecta');

    // Si el proveedor está suspendido → bloquear acceso
    if (provider.status === ProviderStatus.SUSPENDED) {
      throw new UnauthorizedException(
        'Tu cuenta está suspendida. Contacta con soporte para más información.',
      );
    }
    
    // Si el proveedor fue eliminado o inactivo → reactivamos
    if ([ProviderStatus.DELETED, ProviderStatus.INACTIVE].includes(provider.status)) {
      provider.status = ProviderStatus.ACTIVE;
      await this.providersService.save(provider);
    }

    // Si el proveedor está "pendiente" (no aprobado por admin)
    if (provider.status === ProviderStatus.PENDING) {
      throw new UnauthorizedException(
        'Tu cuenta está pendiente de verificación por el administrador.',
      );
    }

    // Si el proveedor está "incompleto"
    if (provider.status === ProviderStatus.INCOMPLETE) {
      return {
        message: 'Debes completar tu registro antes de iniciar sesión.',
        redirect: `${process.env.FRONTEND_BASE_URL}/complete-register-provider/?role=${provider.role}`,
      };
    }

    // Generar token JWT
    const payload = { id: provider.id, email: provider.email, role: provider.role };
    const token = this.jwtService.sign(payload, { expiresIn: '30m' });

    return {
      message: 'Proveedor autenticado correctamente',
      access_token: token,
      provider,
    };
  }

  // Login con Google del proveedor
  async loginGoogleProvider(provider) {
    // Si el proveedor fue eliminado o inactivo → reactivamos
    if ([ProviderStatus.DELETED, ProviderStatus.INACTIVE].includes(provider.status)) {
      provider.status = ProviderStatus.ACTIVE;
      await this.providersService.save(provider);
    }

    // Si el proveedor está "pendiente" (no aprobado por admin)
    if (provider.status === ProviderStatus.PENDING) {
      throw new UnauthorizedException(
        'Tu cuenta está pendiente de verificación por el administrador.',
      );
    }

    // Si el proveedor está incompleto -- redirigir al flujo de completar registro
    if (provider.status === ProviderStatus.INCOMPLETE) {
      return {
        message: 'Debes completar tu registro antes de iniciar sesión.',
        redirect: `${process.env.FRONTEND_BASE_URL}/complete-register-provider/?role=${provider.role}`,
      };
    }

    // Generar token JWT
    const payload = { id: provider.id, email: provider.email, role: provider.role };
    const token = this.jwtService.sign(payload, { expiresIn: '30m' });

    return {
      message: 'Proveedor autenticado correctamente',
      access_token: token,
      provider,
    };
  }
















  
  
  








}
