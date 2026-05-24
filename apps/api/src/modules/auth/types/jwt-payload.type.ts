import { UserRole } from '@finsight/database';

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};
