import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { KycDocumentType, UserRole } from '@finsight/database';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { KycService } from './kyc.service';
import { ReviewKycDto } from './dto/review-kyc.dto';

@Controller('kyc')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post(':clientId/documents/:type')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.CLIENT,
  )
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/kyc',
        filename: (_req, file, callback) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadDocument(
    @Param('clientId') clientId: string,
    @Param('type') type: KycDocumentType,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.kycService.uploadDocument(clientId, type, file);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  findAll() {
    return this.kycService.findAll();
  }

  @Get('clients/:clientId/documents')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.CLIENT,
  )
  findClientDocuments(@Param('clientId') clientId: string) {
    return this.kycService.findClientDocuments(clientId);
  }

  @Patch('documents/:documentId/review')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  reviewDocument(
    @Param('documentId') documentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReviewKycDto,
  ) {
    return this.kycService.reviewDocument(documentId, user.sub, dto);
  }
}
