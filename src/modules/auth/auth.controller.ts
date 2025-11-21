import { Controller, Post, Body, Get, Req, UseGuards, Res, Patch, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import express from 'express';
import { CompleteRegisterUserDto } from './dto/complete-register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateProviderDto } from '../providers/dto/create-provider.dto';
import { ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';

// Controlador de autenticación.
// Maneja registro, login y autenticación con Google para usuarios y proveedores.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Completar registro del proveedor (Google)
  @Patch('complete-register-provider')
  @UseGuards(JwtAuthGuard)
  async completeRegisterProvider(@Req() req, @Body() body: any) {
    const providerId = req.user.id;
    return this.authService.completeRegisterProvider(providerId, body);
  }

  // Recuperar contraseña (usuarios)
  @Post('users/forgot-password')
  async forgotPasswordUser(@Body('email') email: string) {
    return this.authService.sendPasswordResetEmail(email, 'user');
  }

  // Recuperar contraseña (proveedores)
  @Post('providers/forgot-password')
  async forgotPasswordProvider(@Body('email') email: string) {
    return this.authService.sendPasswordResetEmail(email, 'provider');
  }

  // Restablecer contraseña (igual para ambos)
  @Patch('reset-password')
  async resetPassword(
    @Query('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }

  

  // Inicia el flujo de autenticación con Google para usuarios.
  // Redirige al usuario al formulario de inicio de sesión de Google.
  @Get('google/user')
  @UseGuards(AuthGuard('google-user'))
  async googleUserLogin() {}

  @Patch('complete-register-user')
  @UseGuards(JwtAuthGuard)
  async completeRegisterUser(@Req() req, @Body() body: CompleteRegisterUserDto) {
    const userId = req.user.id; // viene del token JWT
    return this.authService.completeRegisterUser(userId, body);
  }

  // Registra un nuevo usuario con email y contraseña.
  @Post('register/user')
  @ApiBody({ type: CreateUserDto })
  registerUser(@Body() body: any) {
    return this.authService.registerUser(body);
  }

  // Registra un nuevo proveedor con email y contraseña.
  @Post('register/provider')
  @ApiBody({ type: CreateProviderDto })
  async registerProvider(@Body() dto: CreateProviderDto) {
    return this.authService.registerProvider(dto);
  }

  // Inicia sesión como usuario.
  // Recibe el email y contraseña, valida las credenciales
  // y devuelve un token JWT si la autenticación es correcta.
  @Post('login/user')
  loginUser(@Body() body: { email: string; password: string }) {
    return this.authService.loginUser(body.email, body.password);
  }

  // Login tradicional de proveedor
  @Post('login/provider')
  async loginProvider(@Body() body: { email: string; password: string }) {
    return this.authService.loginProvider(body.email, body.password);
  }

  // Callback de Google tras autenticación del usuario.
  // Google redirige a esta ruta una vez el usuario ha iniciado sesión.
  // Aquí se obtiene la información del perfil de Google y se genera el token.
  @Get('google/user/callback')
  @UseGuards(AuthGuard('google-user'))
  async googleUserCallback(@Req() req, @Res() res: express.Response) {
    const result = await this.authService.handleGoogleUserRedirect(req.user);
    return res.redirect(result.redirectUrl);
  }

  // Inicia el flujo de autenticación con Google para proveedores.
  // Redirige al proveedor al inicio de sesión de Google.
  @Get('google/provider')
  @UseGuards(AuthGuard('google-provider'))
  async googleProviderLogin() {}

  // Callback de Google tras autenticación del proveedor.
  // Procesa la respuesta de Google, genera el token y redirige al frontend.
  @Get('google/provider/callback')
  @UseGuards(AuthGuard('google-provider'))
  async googleProviderCallback(@Req() req, @Res() res: express.Response) {
    const result = await this.authService.handleGoogleProviderRedirect(req.user);
    return res.redirect(result.redirectUrl);
  }
}
