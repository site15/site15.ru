import { Prisma } from '../../prisma-client';
import { ApiProperty } from '@nestjs/swagger';
import { SsoProject } from './sso-project.entity';
import { SsoOAuthProvider } from './sso-o-auth-provider.entity';
import { SsoUser } from './sso-user.entity';

export class SsoOAuthToken {
  @ApiProperty({
    type: 'string',
  })
  id!: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  grantedAt!: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  expiresAt!: Date | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  tokenType!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  scope!: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  verificationCode!: string | null;
  @ApiProperty({
    type: 'string',
  })
  userId!: string;
  @ApiProperty({
    type: 'string',
  })
  projectId!: string;
  @ApiProperty({
    type: 'string',
  })
  providerId!: string;
  @ApiProperty({
    type: 'string',
  })
  providerUserId!: string;
  @ApiProperty({
    type: () => Object,
    nullable: true,
  })
  providerUserData!: Prisma.JsonValue | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt!: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt!: Date;
  @ApiProperty({
    type: () => SsoProject,
    required: false,
  })
  SsoOAuthProvider_SsoOAuthToken_projectIdToSsoOAuthProvider?: SsoProject;
  @ApiProperty({
    type: () => SsoOAuthProvider,
    required: false,
  })
  SsoOAuthProvider?: SsoOAuthProvider;
  @ApiProperty({
    type: () => SsoUser,
    required: false,
  })
  SsoUser?: SsoUser;
}
