import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleProviderStrategy extends PassportStrategy(Strategy, 'google-provider') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_PROVIDER_CLIENT_ID,
      clientSecret: process.env.GOOGLE_PROVIDER_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_PROVIDER_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log('VALIDANDO PROVEEDOR GOOGLE...', profile);

    try {
      const { name, emails, photos } = profile;

      const providerData = {
        names: name?.givenName,
        surnames: name?.familyName,
        email: emails?.[0]?.value,
        profilePicture: photos?.[0]?.value,
        role: 'provider',
      };

      const provider = await this.authService.validateOrCreateGoogleProvider(providerData);
      console.log('Proveedor Google validado/creado:', provider);
      done(null, provider);
    } catch (error) {
      console.error('ERROR EN VALIDATE GOOGLE PROVIDER:', error);
      done(error, null);
    }
  }
}
