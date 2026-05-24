import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const REFRESH_COOKIE = 'refresh_token';

type AuthCookieRequest = Request & {
  cookies?: {
    [REFRESH_COOKIE]?: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.authService.login(dto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    res.cookie(REFRESH_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken: result.accessToken,
      user: result.user,
    });
  }

  @Post('refresh')
  async refresh(@Req() req: AuthCookieRequest, @Res() res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];

    if (!token) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const result = await this.authService.refresh(token);

    res.cookie(REFRESH_COOKIE, result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      accessToken: result.accessToken,
    });
  }

  @Post('logout')
  async logout(@Req() req: AuthCookieRequest, @Res() res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];

    if (token) {
      await this.authService.logout(token);
    }

    res.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res.json({ success: true });
  }
}
