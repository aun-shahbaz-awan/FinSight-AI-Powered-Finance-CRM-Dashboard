import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    return user;
  }

  async login(dto: LoginDto, meta: { userAgent?: string; ipAddress?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.generateRefreshToken();

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, 12),
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
        expiresAt: addDays(new Date(), 30),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async refresh(refreshToken: string) {
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: {
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    for (const token of storedTokens) {
      const isValid = await bcrypt.compare(refreshToken, token.tokenHash);

      if (!isValid) continue;

      await this.prisma.refreshToken.update({
        where: { id: token.id },
        data: { revokedAt: new Date() },
      });

      const newRefreshToken = this.generateRefreshToken();

      await this.prisma.refreshToken.create({
        data: {
          userId: token.userId,
          tokenHash: await bcrypt.hash(newRefreshToken, 12),
          expiresAt: addDays(new Date(), 30),
        },
      });

      const accessToken = await this.generateAccessToken({
        sub: token.user.id,
        email: token.user.email,
        role: token.user.role,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: token.user.id,
          email: token.user.email,
          firstName: token.user.firstName,
          lastName: token.user.lastName,
          role: token.user.role,
          status: token.user.status,
        },
      };
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  async logout(refreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        revokedAt: null,
      },
    });

    for (const token of tokens) {
      const isValid = await bcrypt.compare(refreshToken, token.tokenHash);

      if (isValid) {
        await this.prisma.refreshToken.update({
          where: { id: token.id },
          data: { revokedAt: new Date() },
        });

        return { success: true };
      }
    }

    return { success: true };
  }

  private async generateAccessToken(payload: JwtPayload) {
    return this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });
  }

  private generateRefreshToken() {
    return crypto.randomUUID() + crypto.randomUUID();
  }
}
