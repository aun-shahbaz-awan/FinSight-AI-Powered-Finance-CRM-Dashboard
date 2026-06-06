import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  KycDocumentStatus,
  KycDocumentType,
  KycStatus,
  type KycDocument,
  type Prisma,
} from '@finsight/database';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ReviewKycDto } from './dto/review-kyc.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { resolveClientIdForActor } from '../../common/auth/client-access.util';

type KycDocumentWithReviewContext = Prisma.KycDocumentGetPayload<{
  include: {
    client: {
      include: {
        user: {
          select: {
            id: true;
            email: true;
            firstName: true;
            lastName: true;
          };
        };
      };
    };
    reviewedBy: {
      select: {
        id: true;
        email: true;
        firstName: true;
        lastName: true;
      };
    };
  };
}>;

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async uploadDocument(
    requestedClientId: string,
    type: KycDocumentType,
    file: Express.Multer.File,
    actor: JwtPayload,
  ) {
    const clientId = await resolveClientIdForActor(
      this.prisma,
      actor,
      requestedClientId,
    );
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG, and PDF files are allowed');
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const document: KycDocument = await this.prisma.kycDocument.create({
      data: {
        clientId,
        type,
        fileName: file.originalname,
        fileUrl: `/uploads/kyc/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    await this.prisma.client.update({
      where: { id: clientId },
      data: {
        kycStatus: KycStatus.PENDING,
      },
    });

    return document;
  }

  async findAll(): Promise<KycDocumentWithReviewContext[]> {
    return this.prisma.kycDocument.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        reviewedBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findClientDocuments(requestedClientId: string, actor: JwtPayload) {
    const clientId = await resolveClientIdForActor(
      this.prisma,
      actor,
      requestedClientId,
    );

    return this.prisma.kycDocument.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reviewDocument(
    documentId: string,
    reviewerId: string,
    dto: ReviewKycDto,
  ): Promise<KycDocument> {
    const document: KycDocument | null =
      await this.prisma.kycDocument.findUnique({
        where: { id: documentId },
      });

    if (!document) {
      throw new NotFoundException('KYC document not found');
    }

    if (dto.status === KycDocumentStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required');
    }

    const updatedDocument: KycDocument = await this.prisma.kycDocument.update({
      where: { id: documentId },
      data: {
        status: dto.status,
        rejectionReason:
          dto.status === KycDocumentStatus.REJECTED
            ? dto.rejectionReason
            : null,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
      },
    });

    const documents: KycDocument[] = await this.prisma.kycDocument.findMany({
      where: { clientId: document.clientId },
    });

    const hasRejected = documents.some(
      (item) => item.status === KycDocumentStatus.REJECTED,
    );

    const hasPending = documents.some(
      (item) => item.status === KycDocumentStatus.PENDING,
    );

    const hasApproved = documents.some(
      (item) => item.status === KycDocumentStatus.APPROVED,
    );

    let nextKycStatus: KycStatus = KycStatus.PENDING;

    if (hasRejected) {
      nextKycStatus = KycStatus.REJECTED;
    } else if (hasApproved && !hasPending) {
      nextKycStatus = KycStatus.APPROVED;
    }

    await this.prisma.client.update({
      where: { id: document.clientId },
      data: {
        kycStatus: nextKycStatus,
      },
    });

    return updatedDocument;
  }
}
