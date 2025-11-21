import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Role } from '../roles.enum';
import { UserStatus } from 'src/modules/users/enums/user-status.enum';

@Injectable()
export class GoogleUserStrategy extends PassportStrategy(Strategy, 'google-user') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_USER_CLIENT_ID,
      clientSecret: process.env.GOOGLE_USER_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_USER_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  // Valida o crea un usuario después de autenticarse con Google
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log('VALIDANDO USUARIO GOOGLE...', profile);

    try {
      const { name, emails, photos } = profile;

      // Construcción del objeto de datos desde el perfil de Google
      const userData = {
        names: name?.givenName || '',
        surnames: name?.familyName || '',
        email: emails?.[0]?.value?.toLowerCase(),
        profilePicture: photos?.[0]?.value || null,
        role: Role.User,
        status: UserStatus.INCOMPLETE, // se asigna directamente aquí
      };

      // Validar o crear el usuario en base de datos
      const user = await this.authService.validateOrCreateGoogleUser(userData);

      console.log('Usuario Google validado/creado:', {
        id: user.id,
        email: user.email,
        status: user.status,
      });

      done(null, user);
    } catch (error) {
      console.error('ERROR EN VALIDATE GOOGLE:', error);
      done(error, null);
    }
  }
}