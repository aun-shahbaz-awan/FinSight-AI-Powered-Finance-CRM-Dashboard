import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@finsight/database';
import { PrismaService } from '../../database/prisma.service';
import { JwtPayload } from '../../modules/auth/types/jwt-payload.type';

export async function resolveClientIdForActor(
  prisma: PrismaService,
  actor: JwtPayload,
  requestedClientId?: string,
): Promise<string> {
  if (actor.role === UserRole.CLIENT) {
    const client = await prisma.client.findUnique({
      where: {
        userId: actor.sub,
      },
    });

    if (!client) {
      throw new ForbiddenException('Client profile not found');
    }

    return client.id;
  }

  if (!requestedClientId) {
    throw new ForbiddenException('clientId is required');
  }

  return requestedClientId;
}
